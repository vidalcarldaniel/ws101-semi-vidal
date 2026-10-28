# Database Schema — Momentum

Self-hosted Supabase (PostgreSQL 17) · Source of truth: [`supabase/migrations/20261027000001_init.sql`](../supabase/migrations/20261027000001_init.sql)

## ERD

```mermaid
erDiagram
    AUTH_USERS ||--o{ GOALS : "owns"
    AUTH_USERS ||--o{ SUBTASKS : "owns"
    AUTH_USERS ||--o{ NOTIFICATION_LOG : "owns"
    GOALS ||--o{ SUBTASKS : "contains"
    GOALS ||--o{ NOTIFICATION_LOG : "triggers"

    GOALS {
        uuid id PK
        uuid user_id FK        "→ auth.users.id"
        text title             "1..120 chars"
        text description       "nullable, ≤2000 chars"
        text category          "general|work|study|health|finance|personal"
        text priority          "low|medium|high"
        text status            "pending|in_progress|completed|cancelled"
        timestamptz due_at     "THE goal date & time"
        int reminder_minutes_before "0..10080 (7 days)"
        timestamptz completed_at    "required when status=completed"
        timestamptz created_at
        timestamptz updated_at  "auto (trigger)"
    }
    SUBTASKS {
        uuid id PK
        uuid goal_id FK         "→ goals.id (cascade delete)"
        uuid user_id FK         "→ auth.users.id"
        text title              "1..200 chars"
        bool is_done
        int position
        timestamptz created_at
    }
    NOTIFICATION_LOG {
        uuid id PK
        uuid user_id FK         "→ auth.users.id"
        uuid goal_id FK         "→ goals.id (cascade delete)"
        text kind               "reminder|deadline"
        timestamptz fired_at
    }
```

## Tables & relationships

### `goals`
The core entity: a commitment with an **exact deadline** (`due_at`, `timestamptz`).
`reminder_minutes_before` defines the alarm window — the alarm engine fires a
*reminder* when `now >= due_at − reminder_minutes_before`, and a *deadline* alarm
when `now >= due_at`. Constraints:

- `title` 1–120 chars; `description` ≤ 2000 chars
- enums enforced by `CHECK` (category, priority, status)
- `reminder_minutes_before` between 0 (no reminder) and 10080 (7 days)
- **`completed_has_timestamp`**: a goal marked `completed` must have `completed_at`
- `updated_at` maintained by the `set_updated_at()` trigger

Indexes: `(user_id, due_at)` for the dashboard ordering, `(user_id, status)` for filters.

### `subtasks`
Optional checklist inside a goal. Deleting a goal cascades to its subtasks.
A subtask can only be created for a goal the same user owns (RLS `EXISTS` check).

### `notification_log`
Append-only record of fired alarms (`kind` = `reminder` or `deadline`, `fired_at`).
The `GET /api/goals/due` endpoint excludes goals that already have a log entry,
so **each alarm rings exactly once**, even across tabs or devices.

## Access controls (RLS)

Every table has **Row Level Security enabled** with owner-only policies:

| Policy | Table | Rule |
|--------|-------|------|
| `goals_select_own` / `insert` / `update` / `delete` | goals | `auth.uid() = user_id` |
| `subtasks_*_own` | subtasks | `auth.uid() = user_id` (+ insert requires owning the parent goal) |
| `notification_log_select/insert/delete_own` | notification_log | `auth.uid() = user_id` |

Consequences:

- The browser only ever receives the **anon key**; without a valid session the
  policies return zero rows.
- The `service_role` key (bypasses RLS) is never shipped to the client and is
  not committed to the repo.
- Even if an attacker forged a request with their own valid session, they could
  only read/write rows whose `user_id` equals their own uid.

## Verifying locally

```bash
npx supabase studio   # open Studio at http://127.0.0.1:55323
# Table Editor -> goals / subtasks / notification_log
```
