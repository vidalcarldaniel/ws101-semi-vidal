"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initial);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to your Momentum account.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">Email</label>
            <input id="email" name="email" type="email" required className={inputClass} />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-danger">{state.fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={inputClass}
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-danger">{state.fieldErrors.password}</p>
            )}
          </div>

          {state.error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
