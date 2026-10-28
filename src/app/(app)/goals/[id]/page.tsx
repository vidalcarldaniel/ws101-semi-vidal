import { notFound } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";
import { updateGoal } from "@/lib/actions/goals";
import GoalForm from "@/components/goal-form";
import SubtaskPanel from "@/components/subtask-panel";
import DeleteGoalButton from "@/components/delete-goal-button";
import type { Subtask } from "@/lib/types";

export default async function GoalDetailPage(props: PageProps<"/goals/[id]">) {
  const { id } = await props.params;

  const userId = await getUserId();
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId!)
    .maybeSingle();

  if (!goal) notFound();

  const { data: subtasks } = await supabase
    .from("subtasks")
    .select("*")
    .eq("goal_id", id)
    .order("position", { ascending: true });

  // Bind the goal id into the server action used by the form
  const update = updateGoal.bind(null, goal.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{goal.title}</h1>
        <DeleteGoalButton goalId={goal.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Edit goal</h2>
          <div className="mt-4">
            <GoalForm action={update} initial={goal} submitLabel="Save changes" />
          </div>
        </section>

        <SubtaskPanel goalId={goal.id} subtasks={(subtasks ?? []) as Subtask[]} />
      </div>
    </div>
  );
}
