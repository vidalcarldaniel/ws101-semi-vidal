import GoalForm from "@/components/goal-form";
import { createGoal } from "@/lib/actions/goals";

export default function NewGoalPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink">New goal</h1>
      <p className="mt-1 text-sm text-muted">
        Set what you want to achieve and exactly when — Momentum will alarm you
        before the deadline.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs">
        <GoalForm action={createGoal} submitLabel="Create goal" />
      </div>
    </div>
  );
}
