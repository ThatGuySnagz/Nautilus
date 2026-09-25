'use client';

import { deleteProject } from '@/app/actions/projects';
import { useTransition } from 'react';

export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      return;
    }

    startTransition(async () => {
      await deleteProject(projectId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-4 py-2 text-sm rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete Project'}
    </button>
  );
}
