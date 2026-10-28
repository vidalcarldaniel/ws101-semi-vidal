"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initial);

  if (state.success) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-900">Check your inbox</h1>
          <p className="mt-2 text-sm text-emerald-800">
            If email confirmation is enabled, confirm your address, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-500">Start reaching your goals on time.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">Name</label>
            <input
              id="displayName"
              name="displayName"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            {state.fieldErrors?.displayName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.displayName}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
            )}
          </div>

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
