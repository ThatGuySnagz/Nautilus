'use client';

import { login } from '@/app/actions/auth';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-10 rounded-lg bg-zinc-900 text-white font-medium hover:bg-black transition-colors disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? 'Signing in...' : 'Log in'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined as any);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-2xl font-bold text-white">N</div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your Nautilus account</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email or Username</label>
            <input
              name="email"
              type="text"
              required
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="Admin or admin@nautilus.dev"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded">{state.error}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
            Sign up
          </Link>
        </p>

        <div className="mt-8 text-center text-xs text-zinc-400 border-t pt-6 space-y-1">
          <div><strong>Recommended:</strong> <span className="font-medium">Admin</span> / <span className="font-mono">admin123</span></div>
          <div>Other demos: Snagz (admin), bob_codes, charlie_js + password123</div>
        </div>
      </div>
    </div>
  );
}
