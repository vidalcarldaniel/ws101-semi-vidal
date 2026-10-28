import GoalForm from "@/components/goal-form";
import { createGoal } from "@/lib/actions/goals";

export default function NewGoalPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">New goal</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Set what you want to achieve and exactly when — Momentum will alarm you
        before the deadline.
      </p>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <GoalForm action={createGoal} submitLabel="Create goal" />
      </div>
    </div>
  );
}
