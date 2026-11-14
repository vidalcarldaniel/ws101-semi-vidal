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
    <main className="hero-glow flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="max-w-2xl space-y-5">
        <span className="inline-block rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1 text-sm font-medium text-brand-ink">
          Momentum
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Set goals with a date &amp; time.
          <br />
          <span className="text-brand">Get alarmed the moment they matter.</span>
        </h1>
        <p className="text-lg text-muted">
          A full-stack productivity system: goals and subtasks, deadlines with
          browser alarms and notifications, and a live progress dashboard —
          powered by Next.js and a self-hosted Supabase instance running in
          Docker.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-line-strong bg-surface px-6 py-3 font-semibold text-ink shadow-xs transition-colors hover:bg-surface-2"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
