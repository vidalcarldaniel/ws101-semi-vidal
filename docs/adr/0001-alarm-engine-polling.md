# ADR-0001: Client-side polling for the alarm engine

**Status:** Accepted · **Date:** 2026-10-27

## Context

Goals must raise an alarm when their Reminder window opens or their Deadline is
reached. The alarm must work while the user has the app open in a browser tab,
and each alarm must ring exactly once. Candidates:

1. **Supabase Realtime** — subscribe to goal changes over websockets.
2. **Client polling** — the browser asks the server every N seconds which alarms are due.
3. **Web Push / service worker** — OS-level notifications even with the tab closed.

## Decision

We chose **client polling (option 2)** with a 15-second interval, backed by a
`notification_log` table that records fired alarms so the server can guarantee
once-only delivery. Web Push is listed as future work.

## Consequences

- **+** No extra infrastructure: the existing PostgREST connection serves the
  due-check; the same RLS policies protect the polling endpoint.
- **+** Once-only semantics live server-side (`notification_log`), so two open
  tabs or a refresh cannot double-ring an alarm.
- **+** The endpoint (`GET /api/goals/due`) is trivially demonstrable with curl
  during the defense.
- **−** An alarm can be up to ~15 s late. Acceptable for a productivity
  reminder; not acceptable for hard real-time needs.
- **−** Alarms only ring while a tab with the app is open. Web Push would lift
  this and is the obvious next step (a service worker + VAPID keys + a small
  scheduled job that marks due alarms).

## Alternatives rejected

- **Supabase Realtime:** solves "changed row" events, but our trigger is *time
  passing*, not a row change — the server would still need a scheduled check,
  so Realtime adds a websocket dependency without removing the hard part.
- **Web Push:** correct long-term answer for closed tabs, but adds service-worker
  + VAPID + push-service complexity beyond this iteration's scope.
