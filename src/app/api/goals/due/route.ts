import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DueGoal } from "@/lib/types";

/**
 * GET /api/goals/due
 * Polling endpoint for the alarm engine. Returns goals whose reminder
 * window or deadline has been reached and that have not fired an alarm
 * yet (per goal + kind, tracked in notification_log).
 */
export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  // 1. Goals already inside their reminder window (due_at - reminder <= now)
  const { data: goals, error } = await supabase
    .from("goals")
    .select("id, title, due_at, reminder_minutes_before, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "in_progress"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Alarms that already fired, so each one rings exactly once
  const { data: fired } = await supabase
    .from("notification_log")
    .select("goal_id, kind");

  const firedSet = new Set(
    (fired ?? []).map((row) => `${row.goal_id}:${row.kind}`)
  );

  const nowMs = Date.now();
  const due: DueGoal[] = [];

  for (const goal of goals ?? []) {
    const dueMs = new Date(goal.due_at).getTime();
    const reminderMs = dueMs - goal.reminder_minutes_before * 60_000;

    if (nowMs >= dueMs) {
      if (!firedSet.has(`${goal.id}:deadline`)) {
        due.push({ id: goal.id, title: goal.title, due_at: goal.due_at, kind: "deadline" });
      }
    } else if (nowMs >= reminderMs && goal.reminder_minutes_before > 0) {
      if (!firedSet.has(`${goal.id}:reminder`)) {
        due.push({ id: goal.id, title: goal.title, due_at: goal.due_at, kind: "reminder" });
      }
    }
  }

  return NextResponse.json({ goals: due });
}

/**
 * POST /api/goals/due
 * Body: { goalId, kind } — records that an alarm fired, so the GET above
 * will not return it again.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const goalId = typeof body?.goalId === "string" ? body.goalId : null;
  const kind = body?.kind === "reminder" || body?.kind === "deadline" ? body.kind : null;

  if (!goalId || !kind) {
    return NextResponse.json(
      { error: "goalId and kind are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("notification_log")
    .insert({ user_id: user.id, goal_id: goalId, kind });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
