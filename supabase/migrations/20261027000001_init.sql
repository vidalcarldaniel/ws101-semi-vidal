-- ============================================================================
-- Momentum — Productivity System: initial schema
-- Self-hosted Supabase (PostgreSQL 15+)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: goals
-- A goal is a commitment the user wants to achieve by a specific date & time.
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
  title                   text not null check (char_length(title) between 1 and 120),
  description             text check (char_length(description) <= 2000),
  category                text not null default 'general'
                            check (category in ('general', 'work', 'study', 'health', 'finance', 'personal')),
  priority                text not null default 'medium'
                            check (priority in ('low', 'medium', 'high')),
  status                  text not null default 'pending'
                            check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  due_at                  timestamptz not null,
  reminder_minutes_before int not null default 0
                            check (reminder_minutes_before between 0 and 10080), -- max 7 days
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  -- A completed goal must carry its completion timestamp
  constraint completed_has_timestamp
    check (status <> 'completed' or completed_at is not null)
);

create index if not exists goals_user_due_idx on public.goals (user_id, due_at);
create index if not exists goals_user_status_idx on public.goals (user_id, status);

-- ---------------------------------------------------------------------------
-- TABLE: subtasks
-- Optional checklist of steps that break a goal into actionable pieces.
-- ---------------------------------------------------------------------------
create table if not exists public.subtasks (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  is_done    boolean not null default false,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists subtasks_goal_idx on public.subtasks (goal_id, position);

-- ---------------------------------------------------------------------------
-- TABLE: notification_log
-- Records every alarm/reminder the app fired, so an alarm rings once per
-- goal (even across tabs/devices) and the defense demo can show history.
-- ---------------------------------------------------------------------------
create table if not exists public.notification_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  goal_id    uuid not null references public.goals (id) on delete cascade,
  kind       text not null check (kind in ('reminder', 'deadline')),
  fired_at   timestamptz not null default now()
);

create index if not exists notification_log_goal_idx on public.notification_log (goal_id, fired_at);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Every table is locked to its owner. The API key shipped to the browser is
-- the anon key; RLS guarantees users only ever see their own rows.
-- ---------------------------------------------------------------------------
alter table public.goals enable row level security;
alter table public.subtasks enable row level security;
alter table public.notification_log enable row level security;

-- goals -------------------------------------------------------------------
create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

-- subtasks ----------------------------------------------------------------
create policy "subtasks_select_own" on public.subtasks
  for select using (auth.uid() = user_id);
create policy "subtasks_insert_own" on public.subtasks
  for insert with check (auth.uid() = user_id and exists (
    select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid()
  ));
create policy "subtasks_update_own" on public.subtasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subtasks_delete_own" on public.subtasks
  for delete using (auth.uid() = user_id);

-- notification_log --------------------------------------------------------
create policy "notification_log_select_own" on public.notification_log
  for select using (auth.uid() = user_id);
create policy "notification_log_insert_own" on public.notification_log
  for insert with check (auth.uid() = user_id);
create policy "notification_log_delete_own" on public.notification_log
  for delete using (auth.uid() = user_id);
