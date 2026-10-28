import { z } from "zod";

/**
 * Validation shared by the forms (client) and the API routes (server).
 * Zod is the single source of truth for what a valid goal looks like.
 */
export const goalInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  category: z.enum(["general", "work", "study", "health", "finance", "personal"]),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  /** Date and time the goal is due, as an ISO string. */
  dueAt: z.iso.datetime({ offset: true }),
  reminderMinutesBefore: z.coerce
    .number()
    .int("Reminder must be a whole number of minutes")
    .min(0)
    .max(10080, "Reminder cannot be more than 7 days before the deadline"),
});

export type GoalInput = z.infer<typeof goalInputSchema>;

export const subtaskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Subtask title is required")
    .max(200, "Subtask title must be 200 characters or fewer"),
});

export type SubtaskInput = z.infer<typeof subtaskInputSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Turn a ZodError into a flat record of field -> first message. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
