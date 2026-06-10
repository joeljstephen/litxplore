# LitXplore Production Deployment and FastAPI Rollback Guide

This guide describes the production setup for the full-stack Next.js version of
LitXplore and how to preserve a practical path back to FastAPI.

## Production Architecture

The production request flow is:

```text
Browser
  -> Vercel Next.js application
     -> App Router pages
     -> /api/v1 Next.js Route Handlers
        -> Clerk authentication
        -> Neon PostgreSQL
        -> Gemini API
        -> arXiv API
```

There is no separate production backend server. The frontend and backend deploy
as one Vercel project.

PDF uploads are intentionally disabled. The implementation remains in the
repository and is controlled by `frontend/src/lib/features.ts`.

## Required Services

1. A Vercel project for the Next.js application.
2. A Neon PostgreSQL project.
3. A Clerk application.
4. A Google Gemini API key.

Use the Neon pooled connection string for Vercel Functions. It normally contains
`-pooler` in the hostname and `sslmode=require`.

## Preserve the FastAPI Version Before Deployment

The pre-migration FastAPI code remains available in Git history. Before
committing the Next.js migration, create and push an archive branch pointing at
the current pre-migration commit:

```bash
git branch archive/fastapi-backend HEAD
git push origin archive/fastapi-backend
```

Do this before committing the current migration. The archive branch gives you a
named, deployable copy of the old FastAPI/Docker implementation.

After committing the migration, optionally tag the first stable Next.js release:

```bash
git tag nextjs-fullstack-v1
git push origin nextjs-fullstack-v1
```

## Prepare the Database

The previous production architecture already used PostgreSQL hosted on Neon.
DigitalOcean hosted the FastAPI container, Redis, and uploaded-file volume, but
the primary relational database was external Neon PostgreSQL. If the existing
Neon project is healthy, no database move is required: use its pooled
`DATABASE_URL` in Vercel and run the schema setup command below.

Set the new Neon pooled connection string temporarily in your shell:

```bash
cd frontend
export DATABASE_URL='postgresql://...'
npm run db:setup
```

The migration creates:

- `literature_reviews`
- `tasks`
- `uploaded_papers`
- `paper_analyses`

It keeps the existing `users` table and other unrelated tables.

Verify the schema in the Neon SQL editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Move to a New Neon Project

Use Neon's direct, non-pooled connection strings for backup and restore. Keep
the source database unchanged until production verification is complete.

```bash
# Export the existing database.
pg_dump "$OLD_NEON_DIRECT_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file=litxplore-production.dump

# Restore it into the new Neon project.
pg_restore \
  --dbname="$NEW_NEON_DIRECT_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  litxplore-production.dump

# Apply any tables/indexes required by the Next.js implementation.
cd frontend
DATABASE_URL="$NEW_NEON_POOLED_URL" npm run db:setup
```

Then set Vercel's `DATABASE_URL` to `NEW_NEON_POOLED_URL`, deploy a preview,
and verify sign-in, review history, analysis, and review generation before
promoting it to production. Keep the old Neon project read-only or backed up
until the new deployment has been stable for an agreed retention period.

## Configure Clerk

Create or update the Clerk webhook:

```text
https://YOUR_PRODUCTION_DOMAIN/api/v1/users/webhook/clerk
```

Subscribe to:

- `user.created`
- `user.updated`

Copy the webhook signing secret into Vercel as
`CLERK_WEBHOOK_SIGNING_SECRET`.

Add the production domain and Vercel preview domains to Clerk's allowed origins
as appropriate.

## Configure Vercel

Import the Git repository into Vercel and set:

```text
Root Directory: frontend
Framework Preset: Next.js
Node.js Version: 20.x or newer
Build Command: npm run build
Install Command: npm install
```

Add these environment variables for Production:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
DATABASE_URL
GOOGLE_GENERATIVE_AI_API_KEY
ANALYZER_MODEL_TAG=gemini-2.5-flash
PROMPT_VERSION=1.0.0
```

Use Clerk's production publishable and secret keys for the Production
environment. Development Clerk keys display a warning and are not suitable for
a public deployment.

Add equivalent Preview values, preferably pointing to a Neon development branch
instead of the production database.

Remove these obsolete variables from Vercel:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WEBSOCKET_URL
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
OPENAI_API_KEY
```

`GEMINI_API_KEY` is accepted as a fallback, but
`GOOGLE_GENERATIVE_AI_API_KEY` is preferred. `GOOGLE_API_KEY` is also accepted
for backward compatibility.

## Pre-Deployment Checks

Run:

```bash
cd frontend
npm install
npm run db:setup
npm run typecheck
npm run build
```

Do not deploy if the build or typecheck fails.

## Post-Deployment Verification

Test public endpoints:

```bash
curl https://YOUR_DOMAIN/health
curl 'https://YOUR_DOMAIN/api/v1/papers/search?query=transformers'
curl 'https://YOUR_DOMAIN/api/v1/papers/1706.03762'
```

Expected results:

- `/health` returns HTTP 200.
- Paper search returns an array of arXiv papers.
- The paper endpoint returns paper metadata.

Then verify in the browser:

1. Sign up and sign in.
2. Search arXiv.
3. Open and analyze a paper.
4. Load in-depth analysis.
5. Chat with a paper.
6. Select papers and generate a literature review.
7. Confirm the review appears in History.
8. Export a review as PDF or text.
9. Confirm PDF upload controls are disabled.

Monitor Vercel Function logs and Neon query activity during verification.

AI features require active Gemini API quota. Before deployment, make a small
test request and confirm the configured Google project has billing/quota
available. A valid key with zero quota returns HTTP 429 and prevents analysis,
chat, and review generation.

## Production Recommendations

### Database

- Use a pooled Neon connection string for Vercel.
- Use a separate Neon branch for preview deployments.
- Enable Neon point-in-time recovery before production traffic.
- Run `db:setup` deliberately during releases instead of relying only on lazy
  schema creation.
- Monitor database size because analysis JSON and any future uploaded PDFs can
  consume storage quickly.

### Serverless Runtime

- AI routes can be slow. Monitor function duration and Gemini errors.
- The Hobby-plan route duration is configured at 60 seconds. Upgrade the plan
  or move long-running generation to a durable worker if requests exceed it.
- Do not use in-memory background tasks for durable work.
- If review generation becomes unreliable or exceeds Vercel limits, move only
  that workload to a queue or FastAPI worker while keeping the rest in Next.js.

### Security

- Never expose `DATABASE_URL`, Clerk secrets, or Gemini keys as
  `NEXT_PUBLIC_*` variables.
- Keep Clerk webhook signature verification enabled.
- Review Vercel and Clerk logs for repeated authentication failures.
- Add rate limiting before opening expensive AI endpoints to high traffic.
- Keep PDF uploads disabled until using dedicated object storage, malware
  scanning, quotas, and cleanup policies.

### Observability

- Enable Vercel runtime logs and alerts.
- Add Sentry or another error tracker before significant production traffic.
- Track Gemini latency, failure rate, and cost.
- Track review-generation success rate separately from ordinary HTTP health.

## FastAPI Rollback Options

### Immediate Full Rollback

Deploy the archived FastAPI branch and restore the previous frontend deployment:

```bash
git switch archive/fastapi-backend
```

Deploy its `backend` directory to the previous container/VPS platform, then set
the frontend's `NEXT_PUBLIC_API_URL` back to that backend URL.

Use this only if the old database schema is still compatible. Always take a Neon
backup before rolling database schema backward.

### Gradual Hybrid Rollback

The preferred future migration path is gradual:

1. Keep the `/api/v1/...` HTTP contract stable.
2. Move one expensive capability, such as analysis or review generation, into
   FastAPI.
3. Keep the corresponding Next.js route handler as a same-origin proxy.
4. Forward Clerk authentication from Next.js to FastAPI.
5. Move additional routes only when there is a measured reason.

This preserves the browser-facing same-origin API and avoids another large
frontend rewrite.

### Recommended FastAPI Boundary

If FastAPI returns, use it for workloads that benefit from Python libraries,
queues, or long-running workers:

- Heavy PDF parsing
- Vector search and embeddings
- Durable review-generation jobs
- Batch processing

Keep these concerns in Next.js:

- UI rendering
- Clerk browser integration
- Lightweight CRUD
- Same-origin API gateway
- Vercel deployment and previews

### Keep Rollback Practical

- Preserve the archive branch.
- Keep `/api/v1` response shapes backward compatible.
- Avoid changing database columns destructively.
- Add new columns and tables before removing old ones.
- Take a Neon backup before every schema migration.
- Document every environment variable used by Next.js and FastAPI.
