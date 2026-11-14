import Link from "next/link";
import { createClient, getUserId } from "@/lib/supabase/server";
import { CATEGORY_LABELS, STATUS_LABELS, type Goal } from "@/lib/types";

export default async function GoalsPage() {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId!)
    .order("due_at", { ascending: true });

  const { data: subtasks } = await supabase
    .from("subtasks")
    .select("goal_id, is_done")
    .eq("user_id", userId!);

  // Progress = completed subtasks / total subtasks, per goal
  const doneByGoal = new Map<string, { done: number; total: number }>();
  for (const st of subtasks ?? []) {
    const entry = doneByGoal.get(st.goal_id) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (st.is_done) entry.done += 1;
    doneByGoal.set(st.goal_id, entry);
  }

  const all = goals ?? [];

  const statusStyles: Record<string, string> = {
    completed: "bg-ok-soft text-ok",
    in_progress: "bg-info-soft text-info",
    cancelled: "bg-surface-2 text-muted",
    pending: "bg-surface-2 text-muted",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Goals</h1>
        <Link
          href="/goals/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong"
        >
          + New goal
        </Link>
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-muted">
          No goals yet.{" "}
          <Link href="/goals/new" className="text-brand hover:underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          {all.map((goal: Goal) => {
            const prog = doneByGoal.get(goal.id);
            return (
              <li key={goal.id}>
                <Link
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-canvas"
                >
                  <div>
                    <p className="font-medium text-ink">{goal.title}</p>
                    <p className="text-xs text-muted">
                      {CATEGORY_LABELS[goal.category]} · {goal.priority} priority · due{" "}
                      {new Date(goal.due_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {prog && prog.total > 0 && (
                      <span className="text-xs tabular-nums text-muted">
                        {prog.done}/{prog.total} steps
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[goal.status]}`}
                    >
                      {STATUS_LABELS[goal.status]}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
