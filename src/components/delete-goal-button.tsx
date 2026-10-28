"use client";

import { useTransition } from "react";
import { deleteGoal } from "@/lib/actions/goals";

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("Delete this goal permanently?")) {
          startTransition(() => deleteGoal(goalId));
        }
      }}
      disabled={isPending}
      className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete goal"}
    </button>
  );
}
