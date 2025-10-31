# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d4501639-b98a-4574-91c1-a85eb2e54baf

## Local development and running the app (Supabase + Gemini server)

This repository was generated from an automated tool and originally used a proprietary runtime. The project has been updated to be independent of that service and to use Supabase for backend and Google Vertex AI (Gemini) for LLM work. Follow these steps to run the app locally.

Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase project (https://supabase.com)
- Supabase service role key (for server-side operations)
- Google Vertex AI credentials OR VERTEX_API_KEY

1) Install dependencies

```powershell
npm install
```

2) Add environment variables

Copy `.env.example` to `.env` and fill in the real values. Required variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- VERTEX_API_KEY OR set GOOGLE_APPLICATION_CREDENTIALS to point to a service account JSON
- VERTEX_PROJECT_ID
- VERTEX_LOCATION (e.g., us-central1)

3) Run Supabase migrations

If using the Supabase CLI:

```powershell
supabase db push --project-ref <your-project-ref>
# or run the SQL in supabase/migrations/20251031_create_schema.sql
psql <connection-string> -f supabase/migrations/20251031_create_schema.sql
```

4) Start the backend server (handles LLM calls and server-side DB writes)

```powershell
npm run dev:server
```

This starts a small Express server on port 8787 by default. It exposes:

- POST /api/market-analyze — accepts { produce_type, location, quantity, quality_grade, additional_notes } and performs LLM calls + saves to Supabase
- GET /api/market-trends?limit=5 — returns recent analyses

5) Start the frontend

In a separate terminal:

```powershell
npm run dev
```

Notes

- Do NOT commit `.env` (this repo now includes `.env.example`).
- If you don't have Vertex credentials, you can stub the LLM responses during development or set VERTEX_API_KEY for testing.

If you'd like, I can add scripts to run the frontend and backend together (concurrently) or prepare Docker configs.
