"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DueGoal } from "@/lib/types";

const POLL_MS = 15_000;

/**
 * AlarmEngine — the notification/alarm heart of Momentum.
 *
 * Every 15 seconds it polls GET /api/goals/due. When a goal enters its
 * reminder window or its deadline passes, it:
 *   1. rings an alarm sound (Web Audio API),
 *   2. fires a system notification (Notification API) when permitted,
 *   3. shows an in-app toast that stays until dismissed.
 * Each alarm is acknowledged with POST /api/goals/due so it rings once.
 */
export default function AlarmEngine() {
  const router = useRouter();
  const [toasts, setToasts] = useState<DueGoal[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "denied" : Notification.permission
  );
  const ringingRef = useRef<Set<string>>(new Set());

  /** Short alarm melody via Web Audio — no audio asset needed. */
  const ring = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const notes = [880, 660, 880, 660, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.25 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.25);
      });
      // Stop the context a moment after the last note to free resources
      setTimeout(() => ctx.close(), notes.length * 250 + 300);
    } catch {
      // Audio unavailable (e.g. autoplay policy) — the toast still shows
    }
  }, []);

  const fire = useCallback(
    async (goal: DueGoal) => {
      const key = `${goal.id}:${goal.kind}`;
      if (ringingRef.current.has(key)) return;
      ringingRef.current.add(key);

      ring();

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(
          goal.kind === "deadline" ? "⏰ Deadline reached!" : "🔔 Goal reminder",
          {
            body: `${goal.title} — due ${new Date(goal.due_at).toLocaleString()}`,
            tag: key,
          }
        );
      }

      setToasts((prev) =>
        prev.some((t) => `${t.id}:${t.kind}` === key) ? prev : [...prev, goal]
      );

      // Acknowledge so this alarm never fires twice
      await fetch("/api/goals/due", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id, kind: goal.kind }),
      }).catch(() => {});
    },
    [ring]
  );

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/goals/due", { cache: "no-store" });
        if (!res.ok) return;
        const data: { goals: DueGoal[] } = await res.json();
        if (cancelled) return;
        for (const goal of data.goals) {
          await fire(goal);
        }
      } catch {
        // Network hiccup — next poll retries
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [fire]);

  const askPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const dismiss = (goal: DueGoal) => {
    setToasts((prev) => prev.filter((t) => `${t.id}:${t.kind}` !== `${goal.id}:${goal.kind}`));
  };

  const goToGoal = (goal: DueGoal) => {
    dismiss(goal);
    router.push(`/goals/${goal.id}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-3">
      {permission !== "granted" && (
        <button
          onClick={askPermission}
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-100"
        >
          <strong className="block">Enable system notifications</strong>
          So alarms ring even when this tab is in the background.
        </button>
      )}

      {toasts.map((goal) => (
        <div
          key={`${goal.id}:${goal.kind}`}
          className="rounded-lg border border-emerald-300 bg-white p-4 shadow-lg"
          role="alert"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-emerald-800">
                {goal.kind === "deadline" ? "⏰ Deadline reached!" : "🔔 Reminder"}
              </p>
              <p className="mt-1 text-sm text-zinc-800">{goal.title}</p>
              <p className="mt-1 text-xs text-zinc-500">
                Due {new Date(goal.due_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => dismiss(goal)}
              aria-label="Dismiss"
              className="text-zinc-400 hover:text-zinc-700"
            >
              ✕
            </button>
          </div>
          <button
            onClick={() => goToGoal(goal)}
            className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Open goal
          </button>
        </div>
      ))}
    </div>
  );
}
