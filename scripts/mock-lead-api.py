#!/usr/bin/env python3
"""Local preview server and mock of POST /api/lead. Never deployed.

    python3 scripts/mock-lead-api.py [--port 8787] [--fail MODE] [--delay SECONDS]

What it does
  - Serves the repo root on http://127.0.0.1:<port> (bound to 127.0.0.1 only;
    http://localhost:<port> works too) with the same clean-URL rules as the
    CloudFront Function (PRD 7.1):
      1. /thank-you.html            -> 301 /thank-you (query string kept)
      2. trailing slash, except "/" -> 301 to the same path without it
      3. last segment has no "."    -> serve <path>/index.html
    Repeated leading slashes are collapsed first, so //evil.example/ can never
    become a protocol-relative redirect. Every response has
    Cache-Control: no-store.
  - Implements POST /api/lead with the validation and responses of the real
    handler, imported from infra/lead-api/src/handler.py (no second copy of the
    rules). The origin-secret check is skipped (only CloudFront can add it); the
    Origin check accepts http://localhost:<port> and http://127.0.0.1:<port>.
  - Stores nothing and writes nothing to disk. Prints one line per API request:
    outcome, status, and field lengths. Never a field value.
  - Refuses path traversal and never serves dotfiles or dot-directories
    (.git/, .agents/, ...), lightroom-sync/, infra/, scripts/, or node_modules/.

Break-it switches (for testing the front end's failure states)
  Set for the whole run on the command line, or per request with a header or a
  query parameter on the API call. A per-request switch overrides the command
  line.

    --fail MODE | header  X-Mock-Fail: MODE | query  /api/lead?mock=MODE
      500      respond 500 {"ok": false}
      429      respond 429 {"message":"Too Many Requests"} (API Gateway's shape)
      413      respond 413 {"ok": false}
      nonjson  respond 200 with an HTML body (not JSON)
      drop     close the connection without sending any response
      email    validate normally; a valid lead gets 200 {"ok": true} and is
               logged as stored_email_failed (what the real function does when
               only the email fails)
      off      no forced failure (use to override a command-line --fail)

    --delay SECONDS | header  X-Mock-Delay: SECONDS | query  ?delay=SECONDS
      Wait before answering (max 120). Use 20 to trip the page's 15-second
      timeout. Combines with any MODE. "slow" is a shorthand MODE for a
      20-second delay.

  Examples
    python3 scripts/mock-lead-api.py --fail 429
    python3 scripts/mock-lead-api.py --delay 20
    curl -X POST -H 'Content-Type: application/json' -H 'X-Mock-Fail: drop' \\
         --data '{}' http://localhost:8787/api/lead
"""

import argparse
import importlib.util
import json
import mimetypes
import os
import posixpath
import socket
import sys
import time
import urllib.parse
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
HANDLER_PATH = REPO_ROOT / "infra" / "lead-api" / "src" / "handler.py"


def load_handler():
    spec = importlib.util.spec_from_file_location("lead_api_handler", HANDLER_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


lead = load_handler()

BLOCKED_TOP_LEVEL = {"lightroom-sync", "infra", "scripts", "node_modules"}
FAIL_MODES = {"500", "429", "413", "nonjson", "drop", "email", "slow", "off"}
MAX_DELAY = 120.0
# The real limit is enforced by the shared handler (10,240 bytes). This cap
# only stops the mock reading an absurd body into memory.
MAX_READ_BYTES = 1_048_576

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
    ".webmanifest": "application/manifest+json",
}


def content_type_for(path):
    ext = Path(path).suffix.lower()
    if ext in CONTENT_TYPES:
        return CONTENT_TYPES[ext]
    guessed, _ = mimetypes.guess_type(str(path))
    return guessed or "application/octet-stream"


def split_target(raw_path):
    """Split a request target into (path, query) without urlsplit, which would
    read a leading "//host" as a network location."""
    target = raw_path.split("#", 1)[0]
    path, _, query = target.partition("?")
    return (path or "/"), query


def clean_url(raw_path):
    """Apply the CloudFront Function rules.

    Returns ("redirect", location) or ("serve", uri_path) or ("bad", None)."""
    path, query = split_target(raw_path)
    query = ("?" + query) if query else ""
    # Collapse repeated leading slashes first.
    path = "/" + path.lstrip("/")

    if path == "/thank-you.html":
        return "redirect", "/thank-you" + query
    if path != "/" and path.endswith("/"):
        stripped = "/" + path.strip("/")
        return "redirect", stripped + query
    last = path.rsplit("/", 1)[-1]
    if path != "/" and "." not in last:
        path = path + "/index.html"
    if path == "/":
        path = "/index.html"
    return "serve", path


def resolve_file(uri_path):
    """Map a URI path to a file under REPO_ROOT, or None if refused/missing."""
    decoded = urllib.parse.unquote(uri_path)
    if "\x00" in decoded or "\\" in decoded:
        return None
    parts = [p for p in decoded.split("/") if p]
    if not parts:
        return None
    for part in parts:
        if part in (".", "..") or part.startswith("."):
            return None
    if parts[0] in BLOCKED_TOP_LEVEL:
        return None
    candidate = (REPO_ROOT / posixpath.join(*parts)).resolve()
    try:
        candidate.relative_to(REPO_ROOT)
    except ValueError:
        return None
    # Re-check after symlink resolution.
    rel_parts = candidate.relative_to(REPO_ROOT).parts
    if not rel_parts or rel_parts[0] in BLOCKED_TOP_LEVEL or any(
        p.startswith(".") for p in rel_parts
    ):
        return None
    if not candidate.is_file():
        return None
    return candidate


class MockHandler(BaseHTTPRequestHandler):
    server_version = "mock-lead-api"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    # Set from the command line in main().
    default_fail = "off"
    default_delay = 0.0
    port = 8787

    # ------------------------------------------------------------ helpers

    def log_message(self, fmt, *args):  # quieter static log, no client IP
        sys.stderr.write("static %s\n" % (fmt % args))

    def send_bytes(self, status, body, content_type, extra=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_json(self, status, obj):
        body = json.dumps(obj, separators=(",", ":")).encode("utf-8")
        self.send_bytes(status, body, "application/json")

    def not_found(self):
        page = REPO_ROOT / "404.html"
        if page.is_file():
            self.send_bytes(404, page.read_bytes(), "text/html; charset=utf-8")
        else:
            self.send_bytes(404, b"Not found\n", "text/plain; charset=utf-8")

    # ------------------------------------------------------------ static

    def do_GET(self):
        if split_target(self.path)[0].rstrip("/") == "/api/lead":
            # API Gateway answers routes it does not have with its own 404.
            self.send_json(404, {"message": "Not Found"})
            return
        kind, value = clean_url(self.path)
        if kind == "redirect":
            self.send_bytes(301, b"", "text/plain; charset=utf-8", {"Location": value})
            return
        target = resolve_file(value)
        if target is None:
            self.not_found()
            return
        self.send_bytes(200, target.read_bytes(), content_type_for(target))

    do_HEAD = do_GET

    def do_OTHER(self):
        if split_target(self.path)[0] == "/api/lead":
            self.send_json(404, {"message": "Not Found"})
        else:
            self.send_bytes(403, b"Forbidden\n", "text/plain; charset=utf-8")

    do_PUT = do_DELETE = do_PATCH = do_OPTIONS = do_OTHER

    # ------------------------------------------------------------ API

    def switches(self, query):
        params = urllib.parse.parse_qs(query)
        fail = (self.headers.get("X-Mock-Fail") or (params.get("mock") or [""])[0]
                or self.default_fail).strip().lower()
        delay_raw = self.headers.get("X-Mock-Delay") or (params.get("delay") or [""])[0]
        try:
            delay = float(delay_raw) if delay_raw else self.default_delay
        except ValueError:
            delay = self.default_delay
        if fail not in FAIL_MODES:
            fail = "off"
        if fail == "slow" and not delay:
            delay = 20.0
        return fail, max(0.0, min(delay, MAX_DELAY))

    def read_body(self):
        length = self.headers.get("Content-Length")
        if length is None:
            return b"", False
        try:
            n = int(length)
        except ValueError:
            return b"", True
        if n < 0:
            return b"", True
        if n > MAX_READ_BYTES:
            return None, True
        return self.rfile.read(n), False

    def do_POST(self):
        path, query = split_target(self.path)
        if path != "/api/lead":
            self.send_bytes(403, b"Forbidden\n", "text/plain; charset=utf-8")
            return

        fail, delay = self.switches(query)
        body, bad_length = self.read_body()
        if delay:
            time.sleep(delay)

        if fail == "drop":
            print(f"api outcome=forced_drop status=- delay={delay:g}", flush=True)
            self.close_connection = True
            try:
                self.connection.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            return
        if fail == "500":
            return self.forced(500, {"ok": False}, delay)
        if fail == "429":
            return self.forced(429, {"message": "Too Many Requests"}, delay)
        if fail == "413":
            return self.forced(413, {"ok": False}, delay)
        if fail == "nonjson":
            print(f"api outcome=forced_nonjson status=200 delay={delay:g}", flush=True)
            self.send_bytes(200, b"<!doctype html><title>Oops</title><p>Not JSON</p>",
                            "text/html; charset=utf-8")
            return

        if body is None:
            # Larger than the mock will read; the real limit is far lower.
            self.close_connection = True
            print("api outcome=too_large status=413 lengths={}", flush=True)
            self.send_json(413, {"ok": False})
            return
        if bad_length:
            self.close_connection = True
            self.send_json(400, {"ok": False, "errors": {}})
            return

        headers = {k: v for k, v in self.headers.items()}
        decision = lead.evaluate(
            headers, body, False,
            origin_secrets=[],
            allowed_origins=[f"http://localhost:{self.port}", f"http://127.0.0.1:{self.port}"],
            check_secret=False,
        )
        outcome = decision.outcome
        if decision.accepted and fail == "email":
            outcome = lead.OUTCOME_STORED_EMAIL_FAILED
        lengths = json.dumps(decision.lengths, separators=(",", ":"), sort_keys=True)
        print(f"api outcome={outcome} status={decision.status} delay={delay:g} "
              f"lengths={lengths}", flush=True)
        self.send_json(decision.status, decision.body)

    def forced(self, status, obj, delay):
        print(f"api outcome=forced_{status} status={status} delay={delay:g}", flush=True)
        self.send_json(status, obj)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Local preview and mock lead API.")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--fail", choices=sorted(FAIL_MODES), default="off")
    parser.add_argument("--delay", type=float, default=0.0)
    args = parser.parse_args(argv)

    MockHandler.default_fail = args.fail
    MockHandler.default_delay = max(0.0, min(args.delay, MAX_DELAY))
    MockHandler.port = args.port

    server = ThreadingHTTPServer(("127.0.0.1", args.port), MockHandler)
    server.daemon_threads = True
    print(f"mock-lead-api: serving {REPO_ROOT} on http://localhost:{args.port} "
          f"(fail={args.fail}, delay={MockHandler.default_delay:g}s). Ctrl-C to stop.",
          flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
