'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { SaveFileResult, saveProjectFile } from '@/app/actions/projects';

interface AddProjectFileFormProps {
  projectId: string;
  projectSlug: string;
  onSuccess?: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full text-xs py-1 disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save file'}
    </button>
  );
}

export default function AddProjectFileForm({
  projectId,
  projectSlug,
  onSuccess,
}: AddProjectFileFormProps) {
  const [state, formAction] = useActionState(saveProjectFile as any, undefined) as any;

  // Handle result
  useEffect(() => {
    if (!state) return;

    if ('success' in state) {
      toast.success('File added successfully!');
      onSuccess?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="mt-2 space-y-2 border rounded p-3 text-sm bg-white dark:bg-zinc-900">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="text"
        name="name"
        placeholder="filename.md or config.json"
        required
        className="form-input text-sm w-full"
      />
      <textarea
        name="content"
        placeholder="File contents..."
        rows={4}
        className="form-input font-mono text-xs w-full"
      />
      <SubmitButton />
    </form>
  );
}
