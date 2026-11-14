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
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-lg font-bold tracking-tight text-brand"
            >
              Momentum
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-muted">
              <Link href="/dashboard" className="transition-colors hover:text-ink">
                Dashboard
              </Link>
              <Link href="/goals" className="transition-colors hover:text-ink">
                Goals
              </Link>
              <Link href="/goals/new" className="transition-colors hover:text-ink">
                New goal
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2">
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
