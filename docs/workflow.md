# Agentic Development Workflow — Momentum

Agent: **OpenCode** (model: MiMo) · Skills: Matt Pocock's `skills` repo
(see [`skills.md`](skills.md)) · Human role: requirements, review, verification.

## Sequence: requirements → planning → agent instructions → implementation → testing/debugging → revisions

### 1. Requirements
The human supplied the goal in one sentence: *"productivity system, set goals
(with date&time), notifies/alarm when the time meets, plus features you can
add"*, plus the WS-101 defense guidelines (Next.js, self-hosted Supabase on
Docker, skills evidence, README, ERD).

**Prompt (verbatim, abridged):**
> "read my docs guideline and apply, my system is productivity system, set
> goals (with date&time), notifies/alarm when the time meets, and other
> feature that you can add for my system to be better, and push it to my
> github repo"

**Decision:** before coding, the agent read the guidelines, cloned the skills
repo, read the relevant SKILL.md files, and asked two scoping questions
(authentication method, feature scope). Human chose: `gh auth login` at push
time; full scope (goals + alarms + subtasks + stats).

### 2. Planning
- `to-spec` skill → `docs/spec.md` (24 user stories, seams identified).
- `domain-modeling` skill → `GLOSSARY.md` (frozen vocabulary).
- ADR for the one hard-to-reverse choice: alarm delivery mechanism
  (`docs/adr/0001-alarm-engine-polling.md`) — polling + once-only log vs
  Supabase Realtime vs Web Push.

### 3. Agent instructions → implementation (order of work)
1. Scaffolded Next.js 16 (create-next-app) — TS, Tailwind, App Router.
2. Read Next.js 16's bundled docs first (the repo's AGENTS.md warned of
   breaking changes) — confirmed: async `params`/`cookies()`, `middleware` →
   `proxy.ts`, `LayoutProps`/`PageProps` route literals.
3. `supabase init` + schema migration (`supabase/migrations/…_init.sql`):
   3 tables, CHECK constraints, `updated_at` trigger, RLS policies.
4. Supabase integration: `@supabase/ssr` browser + server clients, `proxy.ts`
   session refresh + route guard.
5. Server Actions (auth, goals, subtasks) + Zod validation shared with the
   REST API (`/api/goals`, `/api/goals/[id]`, `/api/goals/due`).
6. UI: landing, login/signup (`useActionState`), dashboard (stats + next-up +
   overdue), goals list, goal detail (edit + subtasks + delete), **alarm
   engine** (poll → sound + Notification API + toast, ack so it fires once).
7. Deliverables: README, ERD (`docs/schema.md`), Dockerfile + compose,
   `.env.example`, this workflow doc.

### 4. Testing & debugging (concrete examples)

**Debugging episode 1 — Supabase containers refused to start**
```
listen tcp 0.0.0.0:54322: bind: An attempt was made to access a socket
in a way forbidden by its access permissions
```
*Diagnosis:* `netsh interface ipv4 show excludedportrange protocol=tcp` showed
Windows reserved 54025–54124 and 54225–54324 (Hyper-V/WinNAT), overlapping
every default Supabase port. *Fix:* moved all ports to 5532x in
`supabase/config.toml`; documented in the README.

**Debugging episode 2 — RLS 42501 on a goal insert**
```
new row violates row-level security policy for table "goals"
```
*Diagnosis:* the test request omitted `user_id`; the policy
`auth.uid() = user_id` rejected it — the database, not the app, is the last
line of defense, and it worked. *Fix:* correct the request; kept the policy.

**Debugging episode 3 — TypeScript: `LayoutProps<"/(app)">` failed**
`Type '"/(app)"' does not satisfy the constraint'"/"'` — route *groups* are
invisible in route literals. *Fix:* typed the route-group layout's props as
`{ children: React.ReactNode }`; used `PageProps<"/goals/[id]">` for pages.

**Verification runs (all against the real Docker stack):**
- `npm run build` → compiled, typechecked, 11 routes (proxy + static + dynamic).
- E2E smoke test through the running server with a real session cookie:
  - login via `@supabase/ssr` → cookies issued
  - `/dashboard`, `/goals`, `/goals/new` → **200**
  - `GET /api/goals` → 200 with the user's goals
  - `POST /api/goals` (valid body) → **201**, goal id returned
  - `POST /api/goals` (invalid body) → **400** with per-field Zod errors
  - `GET /api/goals/due` (overdue goal exists) → returns it as `kind: "deadline"`
  - `POST /api/goals/due` (ack) → re-poll no longer returns it (**fires once**)
  - unauthenticated `/api/goals` → redirected by proxy to `/login`
- RLS probes via PostgREST directly: anon sees 0 rows; owner sees their rows.

### 5. Revisions (before → after)
| Before | After | Why |
|---|---|---|
| `cacheComponents: true` (CRA default) | `false` + `output: "standalone"` | Every page is auth-gated/cookie-driven; caching added nothing. Standalone enables the slim Docker image. |
| Alarm tracked in `localStorage` | `notification_log` table + ack endpoint | Once-only semantics must hold across tabs/devices; also gives demoable history |
| Goals page had a placeholder `fetchGoals` type hack | Plain `Goal[]` typing | Cleaner types, no dead code |
| Default Supabase ports | 5532x | Windows excluded port ranges (episode 1) |

### 6. What the human changed/verified
The human chose scope, chose the GitHub auth flow, and approved the plan;
all code, docs, and fixes above were produced by the agent and verified by
running the stack locally (build logs and smoke-test outputs recorded here).
