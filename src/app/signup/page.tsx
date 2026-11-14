"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initial);

  if (state.success) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-xl border border-ok/30 bg-ok-soft p-8 text-center">
          <h1 className="text-2xl font-bold text-ok">Check your inbox</h1>
          <p className="mt-2 text-sm text-ok">
            If email confirmation is enabled, confirm your address, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-brand px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Start reaching your goals on time.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-ink">Name</label>
            <input id="displayName" name="displayName" required className={inputClass} />
            {state.fieldErrors?.displayName && (
              <p className="mt-1 text-xs text-danger">{state.fieldErrors.displayName}</p>
            )}
          </div>
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
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
