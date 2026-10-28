import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { goalInputSchema, fieldErrors } from "@/lib/validation";

/**
 * GET  /api/goals — list the authenticated user's goals
 * POST /api/goals — create a goal (JSON body, validated by the same Zod
 *                   schema the UI forms use)
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("due_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goals: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = goalInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: fieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      category: input.category,
      priority: input.priority,
      status: input.status,
      due_at: input.dueAt,
      reminder_minutes_before: input.reminderMinutesBefore,
      completed_at: input.status === "completed" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goal: data }, { status: 201 });
}
