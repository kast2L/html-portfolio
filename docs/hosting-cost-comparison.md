# Hosting cost comparison: static site versus an always-on web app

*Written 2026-11-10 for Douglas Hill Consulting LLC. Every price below was fetched on 2026-11-10 from the provider's own pricing page or official pricing API, unless labeled **unverified**. AWS prices are US East (N. Virginia), `us-east-1`, except CloudFront, which is priced by viewer location (United States). Azure prices are East US (`eastus`) unless stated. All figures are USD per month and exclude tax.*

---

## 1. Answer in five lines

1. **Current setup (S3 + CloudFront, plus Lambda, API Gateway, DynamoDB, SES):** about **$0.01** a month at the low case ($0.06 at 10×).
2. **Cheapest always-on server on AWS:** Lightsail at **$5.00**; EC2 or Fargate without a load balancer about **$10.42 to $10.86**; App Runner about **$3.88**, but it is closed to new customers.
3. **Production-shaped always-on server on AWS (with an Application Load Balancer):** about **$34.27** (EC2 or Elastic Beanstalk) to **$34.70** (Fargate).
4. **Middle and Azure options:** Amplify Hosting **$0.15**; Azure Static Web Apps Free **$0** or Standard **$9.00**; Azure App Service B1 Linux **$12.41**, P0v3 Linux **$56.58**.
5. **Recommendation:** keep the static site plus one function. An always-on server costs 500 to 3,500 times more and adds patching work. Nothing in the current plan needs a server.

---

## 2. Assumptions

These are assumptions, not measurements.

| Item | Low case (30-day test) | 10× case |
|---|---|---|
| Page views per month | 1,000 | 10,000 |
| Form submissions per month | 20 | 200 |
| Page weight | 400 KB | 400 KB |
| Data served (page views × 400 KB) | 1,000 × 400 KB = 0.4 GB | 10,000 × 400 KB = 4 GB |
| HTTP requests (assumed 10 per page view) | 10,000 | 100,000 |
| Region | US East (N. Virginia) / Azure East US | same |

Other assumptions:

- Site files stored: 0.05 GB (about 8 pages, CSS, JS, images).
- Deploys: 4 a month, about 200 file uploads in total, 2 build minutes each where a build applies.
- Form function: 512 MB memory, 1 second per run. One DynamoDB write per lead (item under 1 KB). About 100 read units a month when Douglas reviews leads. One SES email per lead, to Douglas only.
- API Gateway: 2 requests per submission (allows for a CORS preflight). Behind CloudFront at `/api/lead` there is no preflight, so this overstates slightly.
- S3 GETs: every request counted as a CloudFront cache miss. This is a worst case. In practice most requests are served from cache.
- Monitoring: 2 CloudWatch alarms per option.
- An always-on app runs 730 hours a month.
- DNS (Route 53 hosted zone) and the domain are the same under every option, so they are left out.
- Leads are stored in DynamoDB under every AWS option, so the comparison is like for like. A relational database would add at least $15.00 a month (Lightsail's smallest managed database, see §4.6).

**Which free tier applies.** AWS changed its free tier for accounts created on or after **July 15, 2025**. Accounts created before that date stay on the legacy program: short-term trials, 12-month trials, and always-free offers (AWS News Blog, fetched 2026-11-10). New accounts get $100 in credits, plus up to $100 more for completing activities. The Free plan closes after 6 months or when credits run out, whichever comes first (aws.amazon.com/free, fetched 2026-11-10).

What that means here:
- **Older account (created before July 15, 2025):** such an account is at least 15 months old today, so every 12-month offer has expired. Only always-free offers apply. The "low" and "10×" columns below assume this case.
- **New account (created on or after July 15, 2025):** credits of up to $200 would cover any option in this document for a few months. The Free plan limits which services can be used; this document did not check which services are available on it. Credits are spent, not renewed, so they do not change the steady-state cost.
- **Douglas's account creation date is not known** (see §7). The site has run on S3 and CloudFront since at least early 2026, so the account is almost certainly an existing paid account.

---

## 3. Comparison table

"After free tier" means no free allowance of any kind, including always-free offers. Maintenance hours are estimates (see each section).

| Option | Monthly, low | Monthly, 10× | After free tier (low / 10×) | Maintenance, hours/month (estimate) | Main tradeoff |
|---|---|---|---|---|---|
| **1. Current: S3 + CloudFront + Lambda + API Gateway HTTP API + DynamoDB + SES** | **$0.01** | **$0.06** | $0.25 / $0.71 | 0.5–1 | Lowest cost and smallest attack surface; no server-side rendering or logins |
| 2a. AWS App Runner, 0.25 vCPU / 0.5 GB | $3.88 | $5.18 | $4.08 / $5.38 | 1–2 | Closed to new customers; only usable if the account already uses App Runner |
| 2b. EC2 t4g.micro, no load balancer (or Elastic Beanstalk single-instance) | $10.42 | $10.44 | $10.67 / $11.09 | 3–5 | One server to patch; single point of failure |
| 2c. EC2 t4g.micro + Application Load Balancer (or Elastic Beanstalk load-balanced) | $34.27 | $34.46 | $34.51 / $35.11 | 3–5 | Load balancer is two-thirds of the cost and still one instance behind it |
| 2d. ECS on Fargate, 0.25 vCPU / 0.5 GB ARM, no load balancer | $10.86 | $10.88 | $11.11 / $11.53 | 2–3 | Task IP changes on every restart; not practical without a load balancer |
| 2e. ECS on Fargate + Application Load Balancer | $34.70 | $34.90 | $34.95 / $35.55 | 2–3 | No OS patching, but most setup work of any option |
| 2f. Lightsail $5 instance (IPv4) | $5.00 | $5.02 | $5.00 / $5.02 | 3–4 | Cheapest server; you run TLS and patching yourself |
| 2g. Lightsail Nano container service | $7.00 | $7.02 | $7.00 / $7.02 | 1–2 | 512 MB RAM; container image to maintain |
| 3. AWS Amplify Hosting (static) + same function backend | $0.15 | $0.71 | $0.35 / $0.91 | 0.5–1 | Similar to today; migration work with no cost gain |
| 4a. Azure Static Web Apps Free + managed Functions | $0 | $0 | $0 / $0 | 0.5–1 | No SLA; email and lead storage not priced; moving clouds |
| 4b. Azure Static Web Apps Standard | $9.00 | $9.00 | $9.00 / $9.00 | 0.5–1 | SLA; flat fee |
| 4c. Azure App Service F1 (Free) | $0 | $0 | $0 / $0 | — | **Not usable:** no custom domain on Free tier |
| 4d. Azure App Service B1 Linux | $12.41 | $12.41 | $12.41 / $12.41 | 1–2 | Managed OS; single instance; custom domain and free certificate |
| 4e. Azure App Service P0v3 Linux | $56.58 | $56.58 | $56.58 / $56.58 | 1–2 | Lowest Premium (production) tier |
| 4f. Azure Functions Consumption (form backend only) | $0 | $0 | $0.00 / $0.00 (within monthly grant) | 0.5 | Linux Consumption retires 2028-09-30 |

The always-on rows include the same DynamoDB and SES costs as row 1 ($0.002 low, $0.02 at 10×). They also assume CloudFront stays in front for TLS and caching, where noted.

---

## 4. Each option, with arithmetic and sources

### 4.1 Current: S3 + CloudFront static hosting, plus the planned serverless form backend

**Unit prices (fetched 2026-11-10):**

| Item | Price | Source |
|---|---|---|
| S3 Standard storage, first 50 TB | $0.023 per GB-month | AWS Price List API, AmazonS3, us-east-1 |
| S3 PUT, COPY, POST, LIST | $0.005 per 1,000 | AWS Price List API, AmazonS3, us-east-1 |
| S3 GET | $0.004 per 10,000 ($0.0004 per 1,000) | AWS Price List API, AmazonS3, us-east-1 |
| S3 to CloudFront transfer | Free | aws.amazon.com/s3/pricing |
| CloudFront always-free | 1 TB out, 10,000,000 requests, 2,000,000 Function invocations per month | aws.amazon.com/cloudfront/pricing/pay-as-you-go |
| CloudFront US data out, after free 1 TB | $0.085 per GB | same |
| CloudFront US HTTPS requests | $0.0100 per 10,000 | same, and AWS Price List API |
| CloudFront Functions | $0.10 per 1,000,000 | same |
| Lambda requests | $0.20 per 1,000,000 | aws.amazon.com/lambda/pricing, us-east-1 |
| Lambda compute (x86) | $0.0000166667 per GB-second | same |
| Lambda free tier | 1,000,000 requests and 400,000 GB-seconds per month | same (page does not say whether always-free; see §7) |
| API Gateway HTTP API | $1.00 per 1,000,000 (first 300 million) | aws.amazon.com/api-gateway/pricing, us-east-1 |
| API Gateway free tier | 1,000,000 HTTP API calls per month, 12 months only | same |
| DynamoDB on-demand writes | $0.625 per 1,000,000 write request units | aws.amazon.com/dynamodb/pricing/on-demand, us-east-1 |
| DynamoDB on-demand reads | $0.125 per 1,000,000 read request units | same |
| DynamoDB storage | $0.25 per GB-month; 25 GB free | same |
| SES outbound | $0.10 per 1,000 emails | aws.amazon.com/ses/pricing |
| CloudWatch Logs ingestion | $0.50 per GB; 5 GB free per month | aws.amazon.com/cloudwatch/pricing, us-east-1 |
| CloudWatch alarms | $0.10 per alarm metric; 10 free | same |

**Arithmetic, low case:**

- S3 storage: 0.05 GB × $0.023 = $0.00115
- S3 GET (worst case, all cache misses): 10,000 × $0.0004 / 1,000 = $0.004
- S3 PUT (deploys): 200 × $0.005 / 1,000 = $0.001
- CloudFront: 0.4 GB and 10,000 requests are inside the always-free 1 TB and 10 million requests = $0. Function invocations: 10,000, inside 2 million free = $0.
- Lambda: 20 runs × 0.5 GB × 1 s = 10 GB-seconds, inside the free 400,000 = $0. (Without free tier: 10 × $0.0000166667 + 20 × $0.20 / 1,000,000 = $0.00017.)
- API Gateway: 40 requests × $1.00 / 1,000,000 = $0.00004. The 12-month free tier has expired on an older account.
- DynamoDB: 20 × $0.625 / 1,000,000 + 100 × $0.125 / 1,000,000 = $0.0000125 + $0.0000125 = $0.000025. Storage is a few KB, inside 25 GB free.
- SES: 20 × $0.10 / 1,000 = $0.002
- CloudWatch Logs: about 40 KB, inside 5 GB free = $0. Two alarms, inside 10 free = $0.
- **Total: $0.00115 + $0.004 + $0.001 + $0.00004 + $0.000025 + $0.002 = $0.0082, about $0.01.**

**Arithmetic, 10× case:**

- S3: $0.00115 + (100,000 × $0.0004 / 1,000 = $0.04) + $0.001 = $0.04215
- CloudFront: 4 GB and 100,000 requests, still inside always-free = $0
- Lambda: 100 GB-seconds, inside free = $0
- API Gateway: 400 × $1.00 / 1,000,000 = $0.0004
- DynamoDB: 200 × $0.625 / 1,000,000 + $0.0000125 = $0.000138
- SES: 200 × $0.10 / 1,000 = $0.02
- **Total: $0.04215 + $0.0004 + $0.000138 + $0.02 = $0.0627, about $0.06.**

**After all free tiers (not expected to happen, because CloudFront's allowance is labeled always-free):**

- CloudFront low: 0.4 GB × $0.085 = $0.034; 10,000 × $0.01 / 10,000 = $0.01; 0.01 million × $0.10 = $0.001. Total $0.045.
- CloudFront 10×: 4 × $0.085 = $0.34; 100,000 × $0.01 / 10,000 = $0.10; 0.1 million × $0.10 = $0.01. Total $0.45.
- Alarms: 2 × $0.10 = $0.20.
- Low: $0.0082 + $0.045 + $0.00017 + $0.20 = **$0.25**. 10×: $0.0627 + $0.45 + $0.0017 + $0.20 = **$0.71**.

CloudFront also offers flat-rate plans. The Free plan is $0 a month with 1 million requests, 100 GB transfer, and 5 GB of S3 storage included, with no overage charges (aws.amazon.com/cloudfront/pricing, fetched 2026-11-10). Both traffic cases fit inside it. This document did not check whether the Free plan supports every feature the PRD needs (CloudFront Functions, response headers policies).

**Free tier status.** CloudFront: always-free (stated on the page). Lambda, DynamoDB storage, CloudWatch: a monthly free allowance is shown, but the pages fetched today do not say whether it is always-free or 12-month (see §7). API Gateway: 12 months only, so expired on an older account. SES: no per-message allowance is shown on today's page; new accounts can use credits.

**Maintenance (estimate, medium confidence): 0.5–1 hour a month.** Deploys are a scripted `aws s3 sync`. Check the two alarms. Review Lambda runtime deprecation notices about once a year and move to the next Node.js or Python version (1–2 hours when it happens). No OS to patch. No scaling work.

**Performance and reliability.** Pages are served from CloudFront edge caches, close to the visitor. No server to go down. The only cold start is the form function: the first submission after an idle period waits for Lambda to start (typically well under a second for a small Node.js function; not measured here). The visitor sees "Sending…" during that wait, and the PRD's 15-second timeout covers it. S3, CloudFront, Lambda, and DynamoDB are regional or global managed services with no single instance to fail.

**Security surface.** Static files in a private bucket behind CloudFront, plus one function with one route. No open ports, no OS, no SSH keys, no long-running process. The function's IAM role can be limited to one DynamoDB table and one SES identity. Risks that remain: spam or abuse of the form endpoint (mitigated by the PRD's honeypot, timing check, field limits, and reserved concurrency) and a bug in the function code.

**Note on the plan.** `docs/PRD.md` §7.2 (as read on 2026-11-10) recommends Formspree's free plan for the form, with a Lambda function URL plus SES as the fallback. It does not mention API Gateway or DynamoDB. This document prices the Lambda + API Gateway + DynamoDB + SES design as briefed. Either way the cost rounds to $0. A Lambda function URL would remove the API Gateway line ($0.00004).

### 4.2 AWS App Runner (smallest configuration)

**Availability.** The App Runner developer guide says: "AWS App Runner is no longer open to new customers. Existing customers can continue to use the service as normal." For new customers, AWS recommends Amazon ECS Express Mode (docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html, fetched 2026-11-10). The closing date, reported as April 30, 2026 in a search summary, is **unverified**. Whether Douglas's account counts as an existing App Runner customer is unknown.

**Unit prices (AWS Price List API, AWSAppRunner, us-east-1, fetched 2026-11-10; matches aws.amazon.com/apprunner/pricing):**
- Active vCPU: $0.064 per vCPU-hour
- Memory (provisioned or active): $0.007 per GB-hour
- Automatic deployment: $1.00 per application per month
- Build from source: $0.005 per build minute
- Smallest configuration: 0.25 vCPU, 0.5 GB

**Assumption:** the instance stays provisioned all month and is "active" (billed for vCPU) for 20 hours at the low case and 100 hours at 10×. How App Runner rounds active time for sparse traffic was not confirmed (see §7).

**Arithmetic:**
- Provisioned memory: 0.5 GB × $0.007 × 730 h = $2.555
- Active vCPU, low: 0.25 × $0.064 × 20 h = $0.32. 10×: 0.25 × $0.064 × 100 h = $1.60
- Automatic deployments: $1.00
- DynamoDB + SES: $0.002 low, $0.0205 at 10× (from §4.1)
- **Low: $2.555 + $0.32 + $1.00 + $0.002 = $3.88. 10×: $2.555 + $1.60 + $1.00 + $0.0205 = $5.18.**
- Deploying a container image avoids build minutes. Building from source would add about 4 × 3 min × $0.005 = $0.06.
- After free tier: add $0.20 for two alarms. $4.08 / $5.38.

**Around it for production:** HTTPS endpoint and scaling are managed by App Runner (custom-domain support assumed from the product docs, not checked today). Leads in DynamoDB. Logs to CloudWatch. Optionally keep CloudFront in front for caching.

**Free tier:** none listed on the App Runner pricing page.

**Maintenance (estimate, medium-low confidence): 1–2 hours a month.** Rebuild the container image when the base image or dependencies get security fixes. App code and framework upgrades are yours. No OS patching.

**Performance and reliability.** Requests go to one region; without CloudFront there is no edge cache. Provisioned instances avoid a full cold start, but a scaled-down instance may add latency on the first request (not measured). App Runner gets no new features, per the docs.

### 4.3 EC2 single instance, or Elastic Beanstalk

Elastic Beanstalk has no charge of its own. You pay for the EC2 instances, load balancer, and CloudWatch resources it creates (aws.amazon.com/elasticbeanstalk/pricing, fetched 2026-11-10). A single-instance Beanstalk environment costs the same as 4.3a. A load-balanced one costs the same as 4.3b.

**Unit prices (AWS Price List API, us-east-1, fetched 2026-11-10):**

| Item | Price |
|---|---|
| t4g.nano (2 vCPU, 0.5 GiB), Linux | $0.0042 per hour |
| t4g.micro (2 vCPU, 1 GiB), Linux | $0.0084 per hour |
| t3.micro (2 vCPU, 1 GiB), Linux | $0.0104 per hour |
| EBS gp3 storage | $0.08 per GB-month |
| Public IPv4 address, in use | $0.005 per hour (AmazonVPC) |
| Application Load Balancer | $0.0225 per hour |
| ALB capacity unit (LCU) | $0.008 per LCU-hour |

**Choice:** t4g.micro. The 0.5 GiB nano is too small for a Node.js or Python app plus the OS and a CloudWatch agent.

**4.3a Without a load balancer:**
- Instance: $0.0084 × 730 = $6.132
- 8 GB gp3 root volume: 8 × $0.08 = $0.64
- Public IPv4: $0.005 × 730 = $3.65
- DynamoDB + SES: $0.002 low, $0.0205 at 10×
- **Low: $6.132 + $0.64 + $3.65 + $0.002 = $10.42. 10×: $10.44.**
- TLS: keep the existing CloudFront distribution in front (always-free) and use a free Let's Encrypt certificate on the instance for the origin hop, or accept HTTP between CloudFront and the instance. Either way, CloudFront still serves the public certificate.
- After free tier: add the CloudFront cost from §4.1 ($0.045 / $0.45) and $0.20 for alarms. **$10.67 / $11.09.**

**4.3b With an Application Load Balancer:**
- Load balancer: $0.0225 × 730 = $16.425
- LCUs (assumed average 0.02 LCU low, 0.05 at 10×; unverified usage): 730 × 0.02 × $0.008 = $0.117; 730 × 0.05 × $0.008 = $0.292
- Two public IPv4 addresses for an internet-facing ALB in two Availability Zones (count assumed): 2 × $3.65 = $7.30
- Plus everything in 4.3a: $10.422
- **Low: $16.425 + $0.117 + $7.30 + $10.422 + $0.002 = $34.27. 10×: $16.425 + $0.292 + $7.30 + $10.422 + $0.0205 = $34.46.**
- TLS: an ACM certificate on the load balancer (ACM pricing not fetched today).
- After free tier: add $0.045 / $0.45 for CloudFront and $0.20 for alarms. **$34.51 / $35.11.**

The ALB adds health checks and a stable endpoint, but with one instance behind it there is still one point of failure. Two instances for real redundancy would add another $10.42.

**Free tier:** for an older account, the 12-month EC2 offer has expired. New accounts would draw on credits.

**Maintenance (estimate, medium confidence): 3–5 hours a month.** OS security patches and reboots; app runtime and dependency updates; certificate renewal on the instance if used; disk and log rotation; backups or AMI snapshots; checking CloudWatch. Elastic Beanstalk managed platform updates cut this to about 2–3 hours, but add Beanstalk's own platform version retirements.

**Performance and reliability.** No cold starts, but no scaling either: one t4g.micro serves every request unless CloudFront caches the pages. A burstable instance can run out of CPU credits under sustained load (unlikely at this traffic). The instance, its disk, and its Availability Zone are single points of failure.

**Security surface.** An internet-reachable VM with an OS, open ports 80/443 (or reachable only from the ALB), an SSH or Session Manager path, and a long-running process with IAM credentials. Every unpatched package is exposure. This is the largest surface of all the options.

### 4.4 ECS on Fargate

**Unit prices (AWS Price List API, AmazonECS, us-east-1, fetched 2026-11-10):**
- x86: $0.04048 per vCPU-hour, $0.004445 per GB-hour
- ARM (Graviton): $0.03238 per vCPU-hour, $0.00356 per GB-hour
- Smallest task: 0.25 vCPU, 0.5 GB (the same minimum App Runner uses; not confirmed on a Fargate page today)

**Arithmetic, one ARM task, always on:**
- (0.25 × $0.03238 + 0.5 × $0.00356) × 730 = ($0.008095 + $0.00178) × 730 = $7.209
- (x86 for comparison: (0.25 × $0.04048 + 0.5 × $0.004445) × 730 = $9.01)
- Public IPv4 for the task (needed to pull the image and call SES without a NAT gateway): $3.65

**4.4a Without a load balancer:** $7.209 + $3.65 + $0.002 = **$10.86 low; $10.88 at 10×.** After free tier, with CloudFront and alarms: **$11.11 / $11.53.** In practice this is not workable for a public site. The task's IP changes every time it restarts or redeploys, and CloudFront needs a stable domain name as its origin.

**4.4b With an ALB:** $7.209 + $3.65 + $16.425 + LCU ($0.117 / $0.292) + 2 × $3.65 = **$34.70 low; $34.90 at 10×.** After free tier: **$34.95 / $35.55.**

Not priced: Amazon ECR image storage (a few cents for one small image; **unverified**). A NAT gateway would be needed only if the task ran in a private subnet; it is excluded.

**Amazon ECS Express Mode,** which AWS now recommends in place of App Runner, runs on Fargate and, as far as this document could tell, an Application Load Balancer. Its exact resources and pricing were not checked today, so treat 4.4b as an approximation (**unverified**).

**Maintenance (estimate, medium confidence): 2–3 hours a month**, after 8–16 hours of initial setup (VPC, task definition, ECR, ALB, IAM, logging). No OS patching, but the container image needs rebuilding for base-image fixes.

**Performance and reliability.** No cold start with one task always running. ECS restarts a failed task, but with one task there is downtime while it restarts. Two tasks double the compute line.

**Security surface.** Smaller than EC2 (no SSH, no host OS to manage) but larger than static: a public load balancer, a running container with network access and IAM credentials, and a VPC to configure correctly.

### 4.5 Amazon Lightsail

**Prices (aws.amazon.com/lightsail/pricing, fetched 2026-11-10; region not stated on the page):**
- Smallest Linux instance with public IPv4: $5 a month: 0.5 GB memory, 2 vCPUs, 20 GB SSD, 1 TB transfer
- IPv6-only instance: $3.50 a month (same size). Not usable alone for a public site because many visitors still need IPv4.
- Container service Nano: $7 a month: 0.25 shared vCPU, 512 MB RAM, 500 GB transfer. Micro: $10 a month with 1 GB RAM.
- Load balancer: $18 a month
- Smallest managed database: $15 a month (1 GB, 40 GB SSD)

**Arithmetic:**
- **Instance: $5.00 + DynamoDB/SES $0.002 = $5.00 low; $5.02 at 10×.** Both cases are far inside 1 TB of transfer.
- With a Lightsail load balancer for managed TLS: $5 + $18 = **$23.00**.
- **Container service Nano: $7.00 low; $7.02 at 10×.**
- With a managed database instead of DynamoDB: add $15.00.

**Free tier:** the page says Lightsail can be started free as part of the AWS Free Tier, but does not give the trial length or limits (**unverified**).

**Maintenance (estimate, medium confidence):** instance 3–4 hours a month (same patching and TLS work as EC2, with a simpler console); container service 1–2 hours.

**Performance, reliability, security:** same as a single EC2 instance. One small VM, one point of failure, an OS to patch. 0.5 GB of memory is tight for anything beyond a very small app. Calling DynamoDB and SES from Lightsail needs IAM access keys stored on the instance, which is a weaker pattern than an IAM role.

### 4.6 AWS Amplify Hosting (the middle option)

**Prices (aws.amazon.com/amplify/pricing, fetched 2026-11-10; region not stated):**
- Build minutes (Standard): $0.01 per minute
- Storage on CDN: $0.023 per GB-month, kept until the app is deleted
- Data transfer out: $0.15 per GB served
- Server-side rendering (SSR): $0.30 per 1,000,000 requests and $0.20 per GB-hour
- Free tier: 1,000 build minutes, 5 GB stored, 15 GB served, 500,000 SSR requests, 100 GB-hours. **Free for 12 months only**, so expired on an older account.

**Arithmetic (static hosting, the same form backend from §4.1):**
- Builds: 4 × 2 min × $0.01 = $0.08
- Storage: 4 deploys × 0.05 GB = 0.2 GB kept × $0.023 = $0.0046
- Transfer, low: 0.4 GB × $0.15 = $0.06. 10×: 4 GB × $0.15 = $0.60
- Backend: $0.002 / $0.0205
- **Low: $0.08 + $0.0046 + $0.06 + $0.002 = $0.15. 10×: $0.08 + $0.0046 + $0.60 + $0.0205 = $0.71.**
- After free tier, with alarms: $0.35 / $0.91.
- If the site later used SSR: 1,000 requests × $0.30 / 1,000,000 = $0.0003, plus duration in the cents. SSR on Amplify stays cheap at this traffic.

Note that Amplify's $0.15 per GB is higher than CloudFront's $0.085, and Amplify has no always-free transfer allowance on the page. So Amplify costs more than today at every traffic level.

**Maintenance (estimate, medium confidence): 0.5–1 hour a month,** plus 4–8 hours one time to move the redirects, clean-URL rewrites, and security headers out of the CloudFront Function and response headers policies into Amplify's own settings (whether Amplify supports every header and redirect the PRD needs was not checked; **unverified**).

**Performance, reliability, security:** comparable to today. Content is served from a CDN, with managed TLS, and there is no server to patch. Amplify adds a Git-connected build pipeline, which is another credential and integration to secure.

### 4.7 Azure equivalents (for reference)

**Prices (Azure Retail Prices API, prices.azure.com, fetched 2026-11-10):**

| Item | Price | Region |
|---|---|---|
| Static Web Apps Standard | $9.00 per app per month | eastus2, centralus, westus2 (no `eastus` row returned) |
| Static Web Apps Standard bandwidth | 100 GB included, then $0.20 per GB | same |
| App Service F1 (Linux and Windows) | $0.00 per hour | eastus |
| App Service B1 Linux | $0.017 per hour | eastus |
| App Service S1 Linux | $0.095 per hour | eastus |
| App Service P0v3 Linux | $0.0775 per hour | eastus |
| Functions (Consumption) executions | $0.20 per 1,000,000 ($0.000002 per 10) after the first 1,000,000 | eastus |
| Functions (Consumption) execution time | $0.000016 per GB-second after the first 400,000 | eastus |
| Functions Flex Consumption, on demand | $0.40 per 1,000,000 executions after 250,000; $0.000026 per GB-second after 100,000 | eastus |

Plan features (Microsoft Learn, fetched 2026-11-10):
- **Static Web Apps Free:** global static content, free auto-renewing TLS, 2 custom domains, managed Azure Functions for APIs, 100 GB bandwidth a month with no overage available, **no SLA**. Standard adds an SLA, more domains, and bring-your-own Functions.
- **App Service Free (F1) and Shared** are "intended only for development and testing purposes". Custom domains need Basic (B1) or higher. When a Free app exceeds its CPU or bandwidth quota it is stopped and returns HTTP 403 until the quota resets.
- **Basic and higher** have a 99.95% SLA and free App Service Managed Certificates.
- **Linux Consumption plan for Functions retires on September 30, 2028.** Flex Consumption is the recommended serverless plan.

**Arithmetic:**
- **SWA Free:** $0 at both cases (0.4 GB and 4 GB are under 100 GB). Lead storage (for example Table Storage) and email (for example Azure Communication Services) are not priced here (see §7).
- **SWA Standard:** $9.00 at both cases.
- **App Service F1:** $0, but it cannot serve `william.llcdouglashill.com`. Not a real option.
- **App Service B1 Linux:** $0.017 × 730 = **$12.41** at both cases.
- **Lowest production tier:** P0v3 Linux, $0.0775 × 730 = **$56.58**. (S1 Linux, the older Standard tier, is $0.095 × 730 = $69.35, so P0v3 is the cheaper production tier.) Microsoft's docs do not name one "lowest production tier"; this document treats Premium v3 as production and Basic as the minimum for a custom domain.
- **Azure Functions Consumption as the form backend:** 20 or 200 executions, under the monthly 1,000,000 free; 10 or 100 GB-seconds, under 400,000 free = **$0**. Flex Consumption is also $0 at this volume (under 250,000 executions and 100,000 GB-seconds). The storage account that Functions needs is not priced here.

**Maintenance (estimate, medium confidence):** SWA 0.5–1 hour a month. App Service B1 1–2 hours (Microsoft patches the OS; runtime and dependency upgrades are yours).

**What moving clouds would involve.** Point the `william` CNAME at Azure. Rebuild the CloudFront Function's redirects and the response headers policies in `staticwebapp.config.json`. Rewrite the Lambda as an Azure Function and replace DynamoDB and SES with Azure storage and email services. Run a second cloud bill and set of credentials. At about $0.01 a month today, the numbers give no reason to move.

---

## 5. What a web app would add, and whether this project needs it

An always-on application server makes these possible. Static files plus one function do not:

- **Server-side rendering:** pages built per request (personalized content, pages from a database).
- **Sessions and logins:** a signed-in area, such as a client portal.
- **An admin screen:** a page where Douglas reviews and edits leads in the browser.
- **A database-backed app:** search, lists, dashboards, or workflows over stored records.
- **Long-running or background work:** queues, scheduled jobs, websockets.

Some of these do not need an always-on server either. An admin view of leads, a login, or a scheduled job can be built with more functions (and Cognito for login). Amplify and Azure Static Web Apps offer SSR or auth without a server to patch.

**Does the current plan need any of them?** No. Based on `docs/PRD.md` sections 1, 2, 5, and 7 (read 2026-11-10):

- §1 and §2: four static pages (`/lp/process-automation`, `/thank-you`, `/privacy`, `/terms`). No logins, no personalized pages. The success measure is booked calls and attributed leads.
- §5: one form. Validation, honeypot, and attribution run in the browser (`js/lead-form.js`, `js/attribution.js`). The only server work is to receive, store, and email a lead.
- §7: the PRD recommends "keep the current static HTML/CSS/JS, no build step, no framework", with clean URLs and security headers handled by a CloudFront Function and response headers policies. Booking is a link to Calendly, and analytics is GA4 loaded in the browser.

Nothing in those sections needs server-side rendering, sessions, or an admin screen. Douglas reviews leads in his email inbox (and, with the DynamoDB design, in the AWS console).

---

## 6. Recommendation

**Keep the static S3 + CloudFront site and one serverless function for the form.** It costs about $0.01 a month at the test's traffic and about $0.06 at ten times that. The cheapest always-on server that is fit for a public site is about $5 to $10 a month. One with a load balancer is about $34. Every always-on option also adds 1 to 5 hours a month of patching and upkeep, a larger attack surface, and a single point of failure. In return it adds nothing the current plan uses.

Revisit this if one of these becomes true:

- **The site needs logins or a client portal.** First choice: keep static hosting and add Cognito plus functions. Second choice: Amplify Hosting or Azure Static Web Apps with built-in auth. Only then an always-on server.
- **The site needs server-rendered pages** (for example a Next.js app, or many pages generated from data). Amplify Hosting SSR stays in the cents at this traffic. ECS Express Mode or Fargate with a load balancer (about $35 a month) is the always-on fallback. App Runner is not available to new customers.
- **Douglas wants a browser admin screen for leads** with editing and search. This can still be serverless. An always-on app is justified only if the admin grows into a real application with many screens and a relational database.
- **Traffic grows by more than 1,000 times**, enough to leave CloudFront's always-free 1 TB and 10 million requests. Even then, static hosting stays cheaper than any server option in this document.
- **Douglas decides to consolidate on Azure** for business reasons (one bill, Power Platform integration). Then Static Web Apps Free or Standard plus Functions Flex Consumption is the like-for-like move. The cost does not justify the move on its own.

---

## 7. What could not be verified

- **Douglas's AWS account creation date,** and so which free-tier program applies. Section 2 assumes an older account with all 12-month offers expired.
- **Whether the Lambda, DynamoDB, and CloudWatch free allowances are always-free or 12-month.** The service pages fetched today show the allowances but do not label them. The AWS Free Tier page did not list per-service limits. Only CloudFront's allowance is labeled always-free on today's page. If they were 12-month only, the current option would rise to about $0.25 / $0.71 (the "after free tier" figures).
- **App Runner's closing date** (April 30, 2026, from a search summary only). The docs page confirms only that it is closed to new customers. Whether Douglas's account is an existing App Runner customer is unknown.
- **App Runner active-time billing** for sparse traffic. The 20-hour and 100-hour active-time figures are assumptions.
- **ALB LCU usage** (0.02 and 0.05 average LCU) and **the number of public IPv4 addresses on an ALB** (two assumed, one per Availability Zone).
- **EC2 and Fargate data transfer** to CloudFront or the internet. Treated as $0 at this volume; not fetched.
- **AWS Certificate Manager pricing** (public certificates assumed free; not fetched).
- **Fargate minimum task size and included ephemeral storage,** and **ECR storage price.**
- **Amazon ECS Express Mode** resources and pricing.
- **Lightsail free-trial length and limits;** whether the Nano container service includes TLS for a custom domain; the region for Lightsail and Amplify prices (not stated on their pages).
- **Amplify Hosting** static-request charges (none listed) and support for every redirect and header the PRD needs.
- **SES legacy free allowance** for older accounts (not shown on today's page).
- **CloudFront flat-rate Free plan** support for CloudFront Functions and response headers policies.
- **Azure:** whether Static Web Apps managed Functions are billed separately; Table Storage, Communication Services email, and the Functions storage account prices; App Service F1 CPU-minute quota figures; Azure free-account terms. None was priced.
- **Cold-start times** for Lambda, App Runner, and Azure Functions. Not measured.
- **Maintenance hours** for every option are estimates, not measurements.

---

## 8. Sources

| URL | What it supports | Fetched 2026-11-10? |
|---|---|---|
| https://aws.amazon.com/free/ | New-account credits ($100 + up to $100), 6-month Free plan, always-free on both plans | Yes |
| https://aws.amazon.com/free/free-tier-faqs/ | Credit expiry rules; no legacy-account details | Yes |
| https://aws.amazon.com/blogs/aws/aws-free-tier-update-new-customers-can-get-started-and-explore-aws-with-up-to-200-in-credits/ | July 15, 2025 cutoff; older accounts stay on legacy 12-month and always-free offers | Yes |
| AWS Price List API, AmazonS3, us-east-1 | S3 storage $0.023/GB, PUT $0.005/1,000, GET $0.004/10,000 | Yes |
| https://aws.amazon.com/s3/pricing/ | S3 to CloudFront transfer free | Yes |
| https://aws.amazon.com/cloudfront/pricing/ | Flat-rate plans (Free $0, Pro $15, and higher) | Yes |
| https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/ | Always-free 1 TB, 10M requests, 2M Functions; $0.085/GB; $0.01/10,000 HTTPS; Functions $0.10/M | Yes |
| AWS Price List API, AmazonCloudFront, United States | HTTPS requests $0.0100/10,000 | Yes |
| https://aws.amazon.com/lambda/pricing/ | $0.20/M requests, $0.0000166667/GB-s, 1M + 400,000 GB-s free | Yes |
| https://aws.amazon.com/api-gateway/pricing/ | HTTP API $1.00/M; 1M free for 12 months | Yes |
| https://aws.amazon.com/dynamodb/pricing/on-demand/ | $0.625/M writes, $0.125/M reads, $0.25/GB, 25 GB free, PITR $0.20/GB | Yes |
| https://aws.amazon.com/ses/pricing/ | $0.10/1,000 emails; credit-based free tier | Yes |
| https://aws.amazon.com/cloudwatch/pricing/ | Logs $0.50/GB, 5 GB free; alarms $0.10, 10 free | Yes (first 100,000 characters of the page) |
| https://aws.amazon.com/apprunner/pricing/ | $0.064/vCPU-h, $0.007/GB-h, 0.25 vCPU / 0.5 GB minimum | Yes |
| AWS Price List API, AWSAppRunner, us-east-1 | Same, plus $1.00 automatic deployment, $0.005 build minute | Yes |
| https://docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html | App Runner closed to new customers; ECS Express Mode recommended | Yes |
| AWS Price List API, AmazonEC2, us-east-1 | t4g.nano $0.0042/h, t4g.micro $0.0084/h, t3.micro $0.0104/h, gp3 $0.08/GB-month | Yes |
| AWS Price List API, AmazonVPC, us-east-1 | Public IPv4 $0.005/h | Yes |
| AWS Price List API, AWSELB, us-east-1 | ALB $0.0225/h, $0.008/LCU-h | Yes |
| AWS Price List API, AmazonECS, us-east-1 | Fargate x86 and ARM vCPU and GB rates | Yes |
| https://aws.amazon.com/elasticbeanstalk/pricing/ | No charge for Beanstalk itself | Yes |
| https://aws.amazon.com/lightsail/pricing/ | $5 and $3.50 instances, $7 Nano container, $18 load balancer, $15 database | Yes |
| https://aws.amazon.com/amplify/pricing/ | Build, storage, transfer, SSR prices; 12-month free tier | Yes |
| https://prices.azure.com/api/retail/prices | App Service F1, B1, S1, P0v3; Static Web Apps Standard; Functions Consumption and Flex rates | Yes |
| https://learn.microsoft.com/azure/static-web-apps/plans | SWA Free vs Standard features, SLA | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/static-web-apps/quotas | 100 GB included bandwidth, $0.20/GB overage on Standard | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/app-service/web-sites-monitor | Free and Shared tiers for dev/test only; quota enforcement | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain | Custom domains need a paid tier, not F1 | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits | App Service SLA 99.95% on Basic and higher | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/azure-functions/consumption-plan | Linux Consumption retires 2028-09-30 | Yes (via Microsoft Learn search) |
| https://learn.microsoft.com/azure/azure-functions/flex-consumption-plan | Flex Consumption is the recommended serverless plan | Yes (via Microsoft Learn search) |
| `docs/PRD.md` §1, §2, §5, §7 | Current plan scope; Formspree recommendation with Lambda fallback | Read locally |
| https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html | App Runner closing date | **Not fetched** (date from search summary only) |
| AWS Certificate Manager pricing | Public certificate cost | **Not fetched** |
| Amazon ECR pricing; ECS Express Mode docs | Image storage; Express Mode resources | **Not fetched** |
| Azure Storage, Communication Services, and free-account pricing | Lead storage, email, free credits on Azure | **Not fetched** |
