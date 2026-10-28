import Link from "next/link";
import { createClient, getUserId } from "@/lib/supabase/server";
import { CATEGORY_LABELS, STATUS_LABELS, type Goal } from "@/lib/types";

function isOverdue(goal: Goal) {
  return (
    goal.status !== "completed" &&
    goal.status !== "cancelled" &&
    new Date(goal.due_at).getTime() < Date.now()
  );
}

function timeLeft(dueAt: string) {
  const ms = new Date(dueAt).getTime() - Date.now();
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60_000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  const human = days >= 1 ? `${days}d` : hours >= 1 ? `${hours}h` : `${mins}m`;
  return ms < 0 ? `${human} ago` : `in ${human}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-500",
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-300",
};

export default async function DashboardPage() {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId!)
    .order("due_at", { ascending: true });

  const all = goals ?? [];
  const active = all.filter((g) => g.status === "pending" || g.status === "in_progress");
  const overdue = active.filter(isOverdue);
  const dueToday = active.filter((g) => {
    const d = new Date(g.due_at);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });
  const completed = all.filter((g) => g.status === "completed");
  const completionRate = all.length
    ? Math.round((completed.length / all.length) * 100)
    : 0;

  const stats = [
    { label: "Active goals", value: active.length },
    { label: "Due today", value: dueToday.length },
    { label: "Overdue", value: overdue.length, alert: overdue.length > 0 },
    { label: "Completion rate", value: `${completionRate}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/goals/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + New goal
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${
              stat.alert ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white"
            }`}
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.alert ? "text-red-600" : ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {overdue.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-800">⚠ Overdue — reschedule or complete them</h2>
          <ul className="mt-2 space-y-1 text-sm text-red-900">
            {overdue.map((g) => (
              <li key={g.id}>
                <Link href={`/goals/${g.id}`} className="hover:underline">
                  {g.title} — was due {new Date(g.due_at).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-zinc-700">Next up</h2>
        {active.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No active goals yet.{" "}
            <Link href="/goals/new" className="text-emerald-700 hover:underline">
              Create your first goal
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {active.slice(0, 6).map((goal) => (
              <li key={goal.id}>
                <Link
                  href={`/goals/${goal.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${PRIORITY_DOT[goal.priority]}`}
                      aria-label={`${goal.priority} priority`}
                    />
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-xs text-zinc-500">
                        {CATEGORY_LABELS[goal.category as keyof typeof CATEGORY_LABELS]} · due{" "}
                        {new Date(goal.due_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={isOverdue(goal) ? "font-semibold text-red-600" : "text-zinc-500"}>
                      {timeLeft(goal.due_at)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[goal.status]}`}
                    >
                      {STATUS_LABELS[goal.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
