# Lightroom-to-S3 Photo Archive Pipeline — Design Spec

## Goal

Build a serverless AWS pipeline that syncs edited photos (JPEG renditions + RAW masters) from Adobe Lightroom cloud to an S3 bucket for long-term archival in Deep Glacier. Triggered on-demand from the AWS Console.

## Prerequisites — Validate Before Building

Two gating questions must be confirmed with Adobe before implementation:

1. **RAW master access:** The `/assets/{id}/master` endpoint may return 403 for standard API consumers. Confirm your Adobe Developer project can download original RAW files. If not, fall back to JPEG renditions only.
2. **Fullsize rendition generation:** Fullsize renditions are generated asynchronously (request → poll → download). Confirm your project has access to the generate-rendition capability. The Lambda flow accounts for async polling with retry.

**Action:** Create an Adobe Developer project, obtain credentials, and test both endpoints manually before writing Lambda code. If RAW masters are unavailable, the pipeline still works for JPEG renditions only — the `originals/` folder would be empty until Adobe grants access.

## Architecture

```
[User] → AWS Console → Invoke Lambda
                          │
                          ▼
                   ┌─────────────┐
                   │   Lambda    │
                   │  Python 3.12│
                   │  512MB mem  │
                   │  15min max  │
                   └──────┬──────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
     SSM Parameter     DynamoDB    Lightroom API
     Store (tokens)   (sync state)  (lr.adobe.io)
                          │
                          ▼
                    ┌───────────┐
                    │  S3 Bucket │
                    └─────┬─────┘
                          │ lifecycle (7 days)
                          ▼
                    Deep Glacier
```

### Components

| Component | Purpose |
|-----------|---------|
| Lambda (Python 3.12, 512MB, 15min timeout) | Orchestrates sync: token refresh, asset listing, download, upload |
| S3 bucket (`douglashill-lightroom-archive`) | Photo storage with lifecycle to Deep Glacier |
| DynamoDB table (`lightroom-sync-state`) | Tracks synced asset IDs and pagination cursor |
| SSM Parameter Store (`/lightroom-sync/*`) | Stores Adobe OAuth credentials and refresh token |

No API Gateway, EventBridge, Step Functions, or SQS. Manual trigger from AWS Console only.

---

## S3 Bucket Design

**Bucket name:** `douglashill-lightroom-archive`

### Folder Structure

```
douglashill-lightroom-archive/
├── albums/
│   ├── hawaii-march-2026/
│   │   ├── metadata.json
│   │   ├── renditions/
│   │   │   ├── IMG_1234.jpg
│   │   │   └── IMG_1235.jpg
│   │   └── originals/
│   │       ├── IMG_1234.ARW
│   │       └── IMG_1235.ARW
│   └── christmas-2025/
│       ├── metadata.json
│       ├── renditions/
│       └── originals/
├── uncategorized/
│   ├── renditions/
│   └── originals/
└── index.json
```

The structure is designed so a static website could be layered on top later. Each album is self-contained with its own `metadata.json`. The root `index.json` lists all albums.

### Object Tags (per file)

- `Album` — Lightroom album name
- `CaptureDate` — ISO 8601 timestamp
- `Camera` — make/model
- `Rating` — star rating (0-5)
- `AssetId` — Lightroom asset ID (for dedup)
- `FileType` — `raw` or `rendition`

Note: S3 allows a maximum of 10 tags per object. Current design uses 6, leaving room for 4 future additions.

### Bucket Settings

- Block all public access
- Server-side encryption (SSE-S3)
- Versioning off
- **Lifecycle rule:** Transition entire bucket to S3 Glacier Deep Archive after 7 days. No expiration.

Note: Glacier Deep Archive has a 180-day minimum storage duration charge. Deleting or overwriting objects before 180 days still incurs the full charge. Since this is write-once archival data with versioning off, this is not a practical concern.

Note: `metadata.json` and `index.json` files will also transition to Glacier. If a future static gallery is built, add a lifecycle rule exclusion for `*.json` files at that time.

---

## Lambda Function Design

**Runtime:** Python 3.12
**Memory:** 512MB
**Timeout:** 15 minutes
**Trigger:** Manual from AWS Console

### Execution Flow

1. Load Adobe tokens from SSM Parameter Store (`/lightroom-sync/*`)
2. Exchange refresh token for new access token via Adobe IMS (`POST https://ims-na1.adobelogin.com/ims/token`)
3. Store updated refresh token back to SSM Parameter Store
4. Get catalog ID (`GET https://lr.adobe.io/v1/catalogs`)
5. List assets from Lightroom API (paginated, 50 per page)
6. For each asset, check DynamoDB via `GetItem` (`pk = ASSET#<id>`) — skip if already synced
7. For each new/unseen asset:
   a. Get asset metadata (EXIF, album, rating)
   b. Request `fullsize` rendition generation, poll until ready (handle async 202 responses), then stream download → stream upload to S3 `albums/{album}/renditions/`
   c. Stream download `master` (RAW) → stream upload to S3 `albums/{album}/originals/` (if API access permits; skip gracefully if 403)
   d. Write asset ID to DynamoDB (mark as synced)
   e. Update album `metadata.json`
8. Update root `index.json`
9. If more pages remain and < 2 minutes of Lambda time left, save cursor to DynamoDB, invoke self for next batch (max chain depth: 20 invocations, tracked via event payload counter — stops and logs if exceeded)
10. Log summary (X synced, X skipped, X errors)

### Album Name Resolution

- Lambda calls `GET /catalogs/{id}/albums` to build album-to-asset mapping
- Album names are slugified for S3 keys (e.g., "Hawaii March 2026" → `hawaii-march-2026`). If two albums produce the same slug, append a disambiguator (e.g., `hawaii-march-2026-2`)
- Photos not in any album go to `uncategorized/`

### Error Handling

- **Rendition 404/202** (not yet generated): skip and log, don't fail the sync
- **RAW master download fails**: still sync the JPEG rendition — partial is better than nothing
- **Token refresh fails**: abort with clear error message
- **429 rate limit**: exponential backoff and retry
- **Lambda timeout approaching**: save cursor to DynamoDB, self-invoke for next batch

### Streaming Upload

RAW files are 25-45MB. Lambda streams bytes from the Lightroom API HTTP response to S3 via multipart upload, buffering one 5-10MB part at a time in memory. S3 multipart upload requires a minimum 5MB part size. At 512MB Lambda memory, this is comfortable even for the largest RAW files. No `/tmp` storage needed.

---

## DynamoDB Table Design

**Table name:** `lightroom-sync-state`
**Capacity mode:** On-demand
**Primary key:** `pk` (String)

### Record Types

**Synced asset:**
```json
{
  "pk": "ASSET#<lightroom_asset_id>",
  "album": "hawaii-march-2026",
  "capture_date": "2026-03-15T14:30:00Z",
  "synced_at": "2026-03-26T10:00:00Z",
  "s3_rendition_key": "albums/hawaii-march-2026/renditions/IMG_1234.jpg",
  "s3_original_key": "albums/hawaii-march-2026/originals/IMG_1234.ARW"
}
```

**Sync cursor (for resuming interrupted syncs):**
```json
{
  "pk": "SYNC#cursor",
  "cursor_href": "<lightroom pagination URL>",
  "started_at": "2026-03-26T10:00:00Z",
  "status": "in_progress | complete"
}
```

Single-table design. Two record types, simple access patterns: lookup asset by ID, read/write cursor. No GSIs needed.

---

## SSM Parameter Store Design

| Parameter | Type | Purpose |
|-----------|------|---------|
| `/lightroom-sync/client-id` | String | Adobe app client ID |
| `/lightroom-sync/client-secret` | SecureString | Adobe app client secret |
| `/lightroom-sync/refresh-token` | SecureString | Adobe OAuth refresh token (updated each run) |

### Initial Setup (one-time, manual)

1. Create Adobe project in Developer Console
2. Complete OAuth authorization code flow once in browser
3. Store all three values in Parameter Store via AWS Console or CLI

**Token expiration note:** Adobe refresh tokens may expire after ~14 days of inactivity. If the Lambda hasn't run in several weeks, the token may be invalid and the OAuth browser flow must be repeated. Consider running the Lambda periodically (even with no new photos) to keep the token alive, or accept the manual re-auth as a trade-off for simplicity.

---

## IAM — Lambda Execution Role

**Role name:** `lightroom-sync-lambda-role`

Least-privilege permissions:

```
S3:
  - s3:PutObject           on arn:aws:s3:::douglashill-lightroom-archive/*
  - s3:GetObject            on arn:aws:s3:::douglashill-lightroom-archive/*
  - s3:PutObjectTagging     on arn:aws:s3:::douglashill-lightroom-archive/*

DynamoDB:
  - dynamodb:GetItem        on lightroom-sync-state
  - dynamodb:PutItem        on lightroom-sync-state

SSM Parameter Store:
  - ssm:GetParameter        on /lightroom-sync/*
  - ssm:PutParameter        on /lightroom-sync/refresh-token only

Lambda:
  - lambda:InvokeFunction   on itself (for self-chaining)

CloudWatch Logs:
  - logs:CreateLogGroup
  - logs:CreateLogStream
  - logs:PutLogEvents
```

No public access anywhere. Only entry point is manual Lambda invocation from the AWS Console.

---

## Cost Estimate

### Monthly (idle, 300GB in Deep Glacier)

| Service | Cost |
|---------|------|
| S3 Deep Glacier (300GB) | ~$0.30 |
| DynamoDB (stored records) | ~$0.01 |
| SSM Parameter Store | $0.00 |
| Lambda | $0.00 |
| **Total** | **~$0.31/month** |

### Per sync run (200 photos from a trip)

| Service | Cost |
|---------|------|
| Lambda (~15 min, 512MB) | ~$0.006 |
| S3 PUT requests | ~$0.002 |
| S3 Standard (7 days before Glacier) | ~$0.21 |
| DynamoDB writes | ~$0.0003 |
| **Total** | **~$0.22** |

### Initial full sync (5,000+ photos, 250GB+)

- One-time cost: ~$2-3 (S3 Standard storage for 250GB x 7 days ≈ $1.34, plus PUT requests and Lambda compute)
- After Glacier transition: drops to ~$0.31/month

---

## Out of Scope (future enhancements)

- Video sync (API supports it, can add later)
- Thumbnail generation for gallery
- Static photo gallery website
- Scheduled/automatic sync via EventBridge
- SNS notifications on sync completion
- CloudFront distribution for serving photos

---

## Tech Stack

- **Language:** Python 3.12
- **AWS Services:** Lambda, S3, DynamoDB, SSM Parameter Store, IAM, CloudWatch
- **External API:** Adobe Lightroom Services API (`https://lr.adobe.io/v1`)
- **Auth:** Adobe IMS OAuth 2.0 (Authorization Code + refresh token rotation)
