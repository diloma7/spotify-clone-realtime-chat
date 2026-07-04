# Spotify Clone Production Roadmap

This project is a full-stack Spotify-style app with a React/Vite frontend,
Express/MongoDB backend, Clerk auth, Cloudinary uploads, Redis-backed caching
and rate limiting, Socket.IO chat, nginx proxying, and Docker Compose for local
orchestration.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Frontend/backend split | Done | Separate `frontend` and `backend` folders. |
| Auth | Partial | Clerk is integrated; callback and socket identity are server-verified; role modeling and validation still need hardening. |
| Music catalog | Partial | Songs/albums work; validation, pagination, and cache invalidation need more coverage. |
| Real-time chat | Partial | Socket.IO uses authenticated identity; conversations, read receipts, pagination, and multi-device presence are still needed. |
| MongoDB | Done | App connects to MongoDB; indexes and migration strategy still needed. |
| Redis | Partial | Redis is used for cache/rate limiting; local startup docs and production fallback need polish. |
| Docker | Partial | Dev and production-style compose paths exist; image scanning and hosted secret management still needed. |
| Nginx | Partial | Dev proxy and production static frontend proxy exist; TLS and CDN strategy still needed. |
| Tests | Missing | Add backend, frontend, and e2e coverage. |
| CI/CD | Missing | Add lint, typecheck, tests, build, and image checks. |
| Monitoring | Missing | Add structured logs, error tracking, uptime checks, and health diagnostics. |

## Phase 1: Stabilize The Existing App

- Fix known correctness bugs in album linkage, upload temp cleanup, and cache invalidation.
- Restore and keep `.env.example` files in sync with the app.
- Start the backend only after required dependencies are reachable.
- Replace stale docs with accurate boot/deployment notes.
- Add request and file validation for critical write paths.

## Phase 2: Security Hardening

- Sync users from verified Clerk server identity, not browser-submitted IDs.
- Keep Socket.IO handshakes authenticated with Clerk tokens.
- Keep chat sender IDs derived from the authenticated socket session.
- Add `helmet`, strict production CORS, upload MIME/type checks, and route-specific rate limits.
- Store production secrets in the hosting platform's secret manager.

## Phase 3: Testing And CI

- Add backend unit tests for services.
- Add integration tests for auth, songs, albums, users, messages, and admin routes.
- Add frontend typecheck, lint, and key component tests.
- Add Playwright smoke tests for login, home, playback, chat, and admin flows.
- Add GitHub Actions for install, lint, typecheck, test, and build.

## Phase 4: Production Deployment

- Build the frontend into static assets instead of running Vite dev server in production.
- Serve frontend assets via nginx, CDN, Vercel, Netlify, or equivalent.
- Harden backend Docker image with `npm ci`, non-root user, health checks, and no install fallback.
- Use MongoDB Atlas, managed Redis, Cloudinary, and Clerk production keys.
- Run all public traffic over HTTPS.

## Phase 5: Observability And Scale

- Make `/health` verify MongoDB and Redis readiness.
- Add structured logs and request IDs.
- Add Sentry or another error tracker.
- Add uptime and API latency monitoring.
- Add pagination and indexes before growing data volume.
