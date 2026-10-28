"use client";

import { useRef, useState, useTransition } from "react";
import { addSubtask, deleteSubtask, toggleSubtask } from "@/lib/actions/goals";
import type { Subtask } from "@/lib/types";

interface Props {
  goalId: string;
  subtasks: Subtask[];
}

/** Client panel for the goal's checklist (subtasks). */
export default function SubtaskPanel({ goalId, subtasks }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleAdd = (formData: FormData) => {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      setError("Subtask title is required");
      return;
    }
    setError(null);
    startTransition(async () => {
      await addSubtask(goalId, formData);
      formRef.current?.reset();
    });
  };

  const done = subtasks.filter((s) => s.is_done).length;
  const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Steps</h2>
        {subtasks.length > 0 && (
          <span className="text-sm text-zinc-500">
            {done}/{subtasks.length} done
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {subtasks.map((st) => (
          <li key={st.id} className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                defaultChecked={st.is_done}
                disabled={isPending}
                onChange={(e) => {
                  const checked = e.target.checked;
                  startTransition(() => toggleSubtask(goalId, st.id, checked));
                }}
                className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
              />
              <span className={st.is_done ? "text-zinc-400 line-through" : ""}>
                {st.title}
              </span>
            </label>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => deleteSubtask(goalId, st.id))}
              className="text-xs text-zinc-400 hover:text-red-600"
              aria-label={`Delete subtask ${st.title}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form ref={formRef} action={handleAdd} className="mt-4 flex gap-2">
        <input
          name="title"
          maxLength={200}
          placeholder="Add a step…"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  );
}
