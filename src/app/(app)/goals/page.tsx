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
    completed: "bg-emerald-100 text-emerald-800",
    in_progress: "bg-blue-100 text-blue-800",
    cancelled: "bg-zinc-200 text-zinc-500",
    pending: "bg-zinc-100 text-zinc-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Link
          href="/goals/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + New goal
        </Link>
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No goals yet.{" "}
          <Link href="/goals/new" className="text-emerald-700 hover:underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {all.map((goal: Goal) => {
            const prog = doneByGoal.get(goal.id);
            return (
              <li key={goal.id}>
                <Link
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-xs text-zinc-500">
                      {CATEGORY_LABELS[goal.category]} · {goal.priority} priority · due{" "}
                      {new Date(goal.due_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {prog && prog.total > 0 && (
                      <span className="text-xs text-zinc-500">
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
