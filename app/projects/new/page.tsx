'use client';

import { createProject } from '@/app/actions/projects';
import Link from 'next/link';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ActionState = {
  error?: string;
  success?: boolean;
  slug?: string;
} | null;

export default function NewProjectPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createProject as any,
    null
  );

  // Redirect on success
  useEffect(() => {
    if (state?.success && state.slug) {
      router.push(`/projects/${state.slug}`); // or the namespaced route if you use it
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/projects" className="text-sm text-orange-600 hover:underline">
        ← All projects
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight mt-1">Create a new project space</h1>
      <p className="text-sm text-zinc-500 mt-1">
        This will give your project its own discussion forum, files, and linked Q&amp;A.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Project name</label>
          <input
            name="name"
            required
            className="form-input"
            placeholder="My Awesome Library"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">URL slug</label>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            className="form-input font-mono"
            placeholder="my-awesome-library"
          />
          <p className="text-xs text-zinc-400 mt-1">
            Lowercase letters, numbers and hyphens. This becomes your project URL.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Short description</label>
          <textarea
            name="description"
            required
            rows={3}
            className="form-input"
            placeholder="What does this project do? Who is it for?"
          />
        </div>

        {state?.error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full disabled:opacity-70"
        >
          {isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
