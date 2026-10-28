"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";
import {
  goalInputSchema,
  subtaskInputSchema,
  fieldErrors,
} from "@/lib/validation";
import type { GoalInput } from "@/lib/validation";

export interface GoalFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

/** Build the database row shape from validated form input. */
function toRow(input: GoalInput) {
  return {
    title: input.title,
    description: input.description || null,
    category: input.category,
    priority: input.priority,
    status: input.status,
    due_at: input.dueAt,
    reminder_minutes_before: input.reminderMinutesBefore,
    // Completing a goal stamps the completion time (checked in the DB too)
    completed_at: input.status === "completed" ? new Date().toISOString() : null,
  };
}

function readForm(formData: FormData): GoalInput {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? "general") as GoalInput["category"],
    priority: String(formData.get("priority") ?? "medium") as GoalInput["priority"],
    status: String(formData.get("status") ?? "pending") as GoalInput["status"],
    dueAt: String(formData.get("dueAt") ?? ""),
    reminderMinutesBefore: Number(formData.get("reminderMinutesBefore") ?? 0),
  };
}

export async function createGoal(
  _prev: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const parsed = goalInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .insert({ ...toRow(parsed.data), user_id: userId })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  redirect(`/goals/${data.id}`);
}

export async function updateGoal(
  goalId: string,
  _prev: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const parsed = goalInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  // RLS also enforces ownership; the explicit eq() keeps intent readable.
  const { error } = await supabase
    .from("goals")
    .update(toRow(parsed.data))
    .eq("id", goalId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath(`/goals/${goalId}`);
  return { id: goalId };
}

export async function deleteGoal(goalId: string) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", goalId).eq("user_id", userId);

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  redirect("/goals");
}

export async function addSubtask(goalId: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const parsed = subtaskInputSchema.safeParse({
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("subtasks")
    .insert({ goal_id: goalId, user_id: userId, title: parsed.data.title });

  revalidatePath(`/goals/${goalId}`);
}

export async function toggleSubtask(goalId: string, subtaskId: string, isDone: boolean) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("subtasks")
    .update({ is_done: isDone })
    .eq("id", subtaskId)
    .eq("user_id", userId);

  revalidatePath(`/goals/${goalId}`);
}

export async function deleteSubtask(goalId: string, subtaskId: string) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("subtasks")
    .delete()
    .eq("id", subtaskId)
    .eq("user_id", userId);

  revalidatePath(`/goals/${goalId}`);
}
