'use client';

import { register } from '@/app/actions/auth';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-10 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
    >
      {pending ? 'Creating account...' : 'Create account'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, undefined as any);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-2xl font-bold text-white">N</div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-zinc-500 mt-1">Join the community</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Username</label>
            <input
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="your_handle"
            />
            <p className="mt-1 text-[10px] text-zinc-400">Letters, numbers, and underscores only</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950"
              placeholder="At least 6 characters"
            />
          </div>

          <SubmitButton />

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded">{state.error}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
