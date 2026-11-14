"use client";

import { useActionState } from "react";
import type { GoalFormState } from "@/lib/actions/goals";
import type { Goal } from "@/lib/types";

interface Props {
  action: (prev: GoalFormState, formData: FormData) => Promise<GoalFormState>;
  initial?: Goal;
  submitLabel: string;
}

/** Converts an ISO timestamp to the value format of <input type="datetime-local"> */
function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CATEGORIES = ["general", "work", "study", "health", "finance", "personal"] as const;
const PRIORITIES = ["low", "medium", "high"] as const;
const STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;

const inputClass =
  "mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function GoalForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as GoalFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink">Title *</label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={initial?.title ?? ""}
          placeholder="e.g. Finish final project slides"
          className={inputClass}
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={initial?.description ?? ""}
          placeholder="Optional details…"
          className={inputClass}
        />
        {state.fieldErrors?.description && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dueAt" className="block text-sm font-medium text-ink">Due (date &amp; time) *</label>
          <input
            id="dueAt"
            name="dueAt"
            type="datetime-local"
            required
            defaultValue={initial ? toLocalInputValue(initial.due_at) : ""}
            className={inputClass}
          />
          {state.fieldErrors?.dueAt && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.dueAt}</p>
          )}
        </div>
        <div>
          <label htmlFor="reminderMinutesBefore" className="block text-sm font-medium text-ink">
            Alarm before deadline
          </label>
          <select
            id="reminderMinutesBefore"
            name="reminderMinutesBefore"
            defaultValue={initial?.reminder_minutes_before ?? 15}
            className={inputClass}
          >
            <option value={0}>No alarm</option>
            <option value={5}>5 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={1440}>1 day before</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? "general"}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-ink">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue={initial?.priority ?? "medium"}
            className={inputClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-ink">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "pending"}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {state.error && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
