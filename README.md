# Momentum — Goal & Alarm Productivity System

A full-stack productivity application: **set goals with a specific date & time, get an alarm/notification when the moment arrives**, break goals into steps, and track progress on a live dashboard.

Built for **WS-101 Full-Stack Development — Semi-Final Project Defense**.

## Stack

| Layer     | Technology |
|-----------|------------|
| Frontend + Backend | **Next.js 16** (App Router, Server Components, Server Actions, Route Handlers) |
| Database + Auth   | **Self-hosted Supabase** (PostgreSQL 17, GoTrue auth, PostgREST) running in **Docker** via the Supabase CLI |
| Validation        | Zod (shared between forms and API) |
| Styling           | Tailwind CSS 4 |
| Agent-assisted dev| OpenCode + Matt Pocock's `skills` repo |

## Features

- **Goals with date & time** — title, description, category, priority, status, exact deadline (datetime).
- **Alarms & notifications** — per-goal alarm window (5 min … 7 days before, or at the deadline). A client-side alarm engine polls the server every 15 s; when a goal is due it rings a sound (Web Audio API), fires a system notification (Notification API), and shows an in-app toast. Each alarm fires **exactly once** (tracked in `notification_log`).
- **Subtasks** — break a goal into steps with a progress bar.
- **Dashboard** — active/due-today/overdue counts, completion rate, "next up" list, overdue warnings.
- **Auth** — email/password sign-up and sign-in (Supabase GoTrue), session refreshed by Next.js proxy middleware.
- **Security** — Row Level Security on every table; only the anon key ships to the browser; all writes are scoped to `auth.uid()`.

## Prerequisites

- Node.js ≥ 20.9
- Docker (running)
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the self-hosted Supabase stack (Docker) and apply migrations
npx supabase start
# -> prints API_URL, ANON_KEY, etc.

# 3. Configure environment
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from the `npx supabase status` output.

# 4. Run the app
npm run dev
# Open http://localhost:3000, create an account, add a goal.
```

> **Ports:** this project's `supabase/config.toml` uses ports 55321–55329 because the
> default 5432x range is inside a Windows excluded port range. Adjust `config.toml`
> if those ports are taken on your machine.

## Try the alarm in 30 seconds

1. Sign up and click **New goal**.
2. Set the due time 1–2 minutes from now and **Alarm before deadline → No alarm** (rings at the deadline).
3. Keep the tab open — when the deadline passes you'll hear the alarm, see a toast, and (if permitted) a system notification.
4. The same alarm appears in the API: `GET /api/goals/due` (authenticated) lists goals whose alarm/deadline has been reached.

## Database

Schema: [`supabase/migrations/20261027000001_init.sql`](supabase/migrations/20261027000001_init.sql) · Diagram & access controls: [`docs/schema.md`](docs/schema.md)

- `goals` — one row per goal; `due_at` (timestamptz) is the deadline; `reminder_minutes_before` sets the alarm window.
- `subtasks` — checklist steps belonging to a goal.
- `notification_log` — every fired alarm (goal + kind + time) so alarms ring once.

All tables have RLS enabled with owner-only policies (`auth.uid() = user_id`).

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/goals` | List the signed-in user's goals |
| POST   | `/api/goals` | Create a goal (Zod-validated JSON) |
| PATCH  | `/api/goals/[id]` | Update a goal (column allowlist) |
| DELETE | `/api/goals/[id]` | Delete a goal |
| GET    | `/api/goals/due` | Goals whose reminder/deadline has been reached (alarm polling) |
| POST   | `/api/goals/due` | Acknowledge an alarm so it fires once |

Example:

```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -b "sb-<project>-auth-token=<session cookie>" \
  -d '{"title":"Ship v1","category":"work","priority":"high",
       "status":"pending","dueAt":"2026-11-01T09:00:00+08:00",
       "reminderMinutesBefore":30}'
```

## Running with Docker

```bash
npx supabase start          # Supabase services (Docker)
docker compose up --build   # the Next.js app in a container (Dockerfile, standalone output)
```

## Project layout

```
src/
  proxy.ts                  # Next.js 16 middleware (session refresh + route guard)
  app/
    page.tsx                # landing
    login/ signup/          # auth pages (Server Actions)
    (app)/dashboard/        # stats + next-up dashboard
    (app)/goals/            # list, new, detail (edit + subtasks + delete)
    api/goals/              # REST route handlers (CRUD + due/ack)
  components/
    alarm-engine.tsx        # client alarm loop: poll -> sound + notification + toast
    goal-form.tsx           # validated goal form
    subtask-panel.tsx       # subtask checklist with progress
  lib/
    supabase/               # browser + server clients (@supabase/ssr)
    actions/                # Server Actions (auth, goals, subtasks)
    validation.ts           # Zod schemas shared by UI and API
    types.ts                # domain types
supabase/
  config.toml               # self-hosted stack config (ports 5532x)
  migrations/               # SQL schema + RLS policies
docs/
  schema.md                 # ERD + access-control explanation
  workflow.md               # agentic development workflow evidence
  skills.md                 # Matt Pocock skills usage evidence
```

## Security notes

- Only the **anon** key is exposed to the browser; **service_role** never leaves the server.
- RLS restricts every read/write to the authenticated owner.
- Inputs are validated server-side (Zod) and DB constraints backstop the API (lengths, enums, `completed_at` requirement).
- No secrets are committed: `.env.local` is gitignored; use `.env.example` as the template.
