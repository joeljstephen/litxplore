# LitXplore

LitXplore is a full-stack Next.js application. The UI and API route handlers deploy together as one Vercel project; no Python service, VPS, Docker runtime, Redis instance, or separate API domain is required.

## Stack

- Next.js App Router and React
- Next.js Route Handlers under `frontend/src/app/api/v1`
- Clerk authentication
- Neon/PostgreSQL for users, reviews, tasks, uploaded PDFs, and analysis cache
- Gemini through the Vercel AI SDK
- arXiv Atom API

## Local development

Use Node.js 20 or newer.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run db:setup
npm run dev
```

Required environment variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
DATABASE_URL=
GOOGLE_GENERATIVE_AI_API_KEY=
```

`GEMINI_API_KEY` can be used instead of `GOOGLE_GENERATIVE_AI_API_KEY`.

## Vercel deployment

1. Set the Vercel project's Root Directory to `frontend`.
2. Add the required environment variables to Production and Preview.
3. Configure the Clerk webhook URL as `https://<domain>/api/v1/users/webhook/clerk`.
4. Run `npm run db:setup` locally once against the production database, or deploy and let the application lazily create missing tables.
5. Remove `NEXT_PUBLIC_API_URL` from Vercel; all API calls are same-origin.

Existing Neon tables and data from the FastAPI deployment remain compatible.

See [Production Deployment and FastAPI Rollback](docs/DEPLOYMENT_AND_ROLLBACK.md)
for the complete production runbook, verification checklist, and rollback plan.

## Runtime constraints

- PDF uploads are currently disabled. The implementation remains behind a feature flag.
- AI analysis, chat, and review routes request a 300-second maximum duration. Actual limits depend on the Vercel plan.
- Uploaded PDFs are stored in Postgres so they survive serverless instance shutdowns.

## Verification

```bash
cd frontend
npm run typecheck
npm run build
```
