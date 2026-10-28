import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import AlarmEngine from "@/components/alarm-engine";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
              Momentum
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-zinc-600">
              <Link href="/dashboard" className="hover:text-zinc-900">Dashboard</Link>
              <Link href="/goals" className="hover:text-zinc-900">Goals</Link>
              <Link href="/goals/new" className="hover:text-zinc-900">New goal</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>

      {/* Alarm engine: polls for due goals and rings on this device */}
      <AlarmEngine />
    </div>
  );
}
