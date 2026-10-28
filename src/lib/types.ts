/** Goal lifecycle. A goal starts `pending` and ends `completed` or `cancelled`. */
export type GoalStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type GoalCategory =
  | "general"
  | "work"
  | "study"
  | "health"
  | "finance"
  | "personal";

export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  /** ISO timestamp of the goal's deadline (date & time). */
  due_at: string;
  reminder_minutes_before: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  is_done: boolean;
  position: number;
  created_at: string;
}

export interface GoalWithSubtasks extends Goal {
  subtasks: Subtask[];
}

/** A goal whose deadline (or reminder window) has been reached. */
export interface DueGoal {
  id: string;
  title: string;
  due_at: string;
  kind: "reminder" | "deadline";
}

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  general: "General",
  work: "Work",
  study: "Study",
  health: "Health",
  finance: "Finance",
  personal: "Personal",
};

export const PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABELS: Record<GoalStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
