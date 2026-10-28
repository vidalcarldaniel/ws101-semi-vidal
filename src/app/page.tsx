import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="space-y-4 max-w-2xl">
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
          Momentum
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Set goals with a date &amp; time.
          <br />
          Get alarmed the moment they matter.
        </h1>
        <p className="text-lg text-zinc-600">
          A full-stack productivity system: goals and subtasks, deadlines with
          browser alarms and notifications, and a live progress dashboard —
          powered by Next.js and a self-hosted Supabase instance running in
          Docker.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 bg-white px-6 py-3 font-semibold hover:bg-zinc-100"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
