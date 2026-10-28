# Spec — Momentum: goal-based productivity system with alarms

> Produced following Matt Pocock's **`to-spec`** skill: synthesized from the
> user's request ("productivity system, set goals with date & time, notifies /
> alarm when the time meets") and the WS-101 defense guidelines.

## Problem Statement

Students and knowledge workers keep commitments in their heads or in plain
checklists with no time dimension. When a deadline passes, nothing tells them —
appointments, study targets, and submission deadlines slip silently.

## Solution

A full-stack web app where every goal carries an **exact date & time**. The
system watches those timestamps and **alarms the user (sound, system
notification, in-app toast) the moment a reminder window opens or a deadline is
reached**, plus shows what is due, overdue, and how much progress has been made.

## User Stories

1. As a user, I want to sign up and sign in securely, so that my goals are private to me.
2. As a user, I want to create a goal with a title and description, so that I can record what I need to do.
3. As a user, I want to set a goal's due **date and time** precisely, so that alarms fire at the right moment.
4. As a user, I want to choose an alarm lead time (5 min … 7 days, or none), so that I get warned before the deadline.
5. As a user, I want to categorize goals (work, study, health, finance, personal, general), so that I can filter my life areas.
6. As a user, I want to set a priority (low/medium/high), so that I can see what matters most.
7. As a user, I want to hear an alarm sound when a goal's time arrives, so that I notice even if the tab is in the background.
8. As a user, I want a system notification when an alarm fires, so that I see it at the OS level.
9. As a user, I want an in-app toast for each due goal, so that I can jump straight to it.
10. As a user, I want each alarm to ring only once, so that I am not nagged repeatedly.
11. As a user, I want to mark goals in progress, completed, or cancelled, so that the list reflects reality.
12. As a user, I want completion timestamped automatically, so that I can trust the history.
13. As a user, I want to break a goal into subtasks, so that big goals become actionable.
14. As a user, I want a progress bar per goal, so that I can see how far I've come.
15. As a user, I want a dashboard with active / due-today / overdue counts and completion rate, so that I can assess my day at a glance.
16. As a user, I want an overdue section that stands out, so that slipped goals don't hide.
17. As a user, I want to edit every field of a goal, so that plans can change.
18. As a user, I want to delete a goal (with confirmation), so that abandoned goals don't clutter my list.
19. As a user, I want my data isolated from other users, so that privacy is guaranteed even against crafted requests.
20. As a user, I want form validation with helpful messages, so that I can't save invalid goals.
21. As a user, I want the alarm engine to keep working across page navigation, so that alarms are never missed while the app is open.
22. As a user, I want a REST API for goals, so that the system can be extended or scripted.
23. As a user, I want a landing page explaining the product, so that first-time visitors know what to do.
24. As a student defending this project, I want the whole stack runnable with Docker + Supabase CLI commands, so that the demo is reproducible.

## Implementation Decisions

- **Framework:** Next.js 16 App Router — Server Components for data display,
  Server Actions for mutations (auth, goals, subtasks), Route Handlers for the
  REST API (`/api/goals`, `/api/goals/due`).
- **Backend:** self-hosted Supabase (PostgreSQL + GoTrue + PostgREST) run via
  `supabase start` (Docker). App DB access goes through PostgREST with the anon
  key + user session; RLS enforces ownership.
- **Alarm delivery:** client-side polling of `GET /api/goals/due` every 15 s;
  alarms acknowledged via `POST /api/goals/due` and recorded in
  `notification_log` so each (goal, kind) fires once. See ADR-0001.
- **Validation:** one Zod schema per input, shared by forms and API handlers.
- **Session:** `@supabase/ssr` cookie sessions; Next.js 16 `proxy.ts` refreshes
  the session and guards routes.
- **Schema:** `goals`, `subtasks`, `notification_log`; enums and lengths
  enforced by CHECK constraints in addition to Zod.

## Testing Decisions

- Tests assert **external behavior** (HTTP status, returned JSON, DB effects),
  never implementation details.
- Seam chosen: the HTTP boundary (REST API + pages), the same seam a user or
  grader exercises.
- Evidence produced during development (see `docs/workflow.md`):
  - E2E smoke test through the real server: sign-in → list pages → create goal
    → due-endpoint returns the overdue goal → acknowledge → re-poll confirms
    the alarm no longer fires.
  - RLS verification: anonymous request sees 0 rows; insert without matching
    `user_id` is rejected by the DB (42501), proving the policy works.

## Out of Scope

- Mobile app / offline support
- Web Push with the tab closed (future work, see ADR-0001)
- Collaborative/shared goals
- Email reminders

## Further Notes

- Supabase ports were moved from 5432x to 5532x because the default range sits
  inside a Windows excluded port range on the dev machine.
