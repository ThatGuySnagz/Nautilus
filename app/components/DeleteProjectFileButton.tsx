'use client';

import { useFormStatus } from 'react-dom';
import { Trash2, Loader2 } from 'lucide-react';
import Icon from './Icon';

interface DeleteProjectFileButtonProps {
  action: (formData: FormData) => void | Promise<void>;
}

export default function DeleteProjectFileButton({ action }: DeleteProjectFileButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (e: React.MouseEvent) => {
    if (!confirm('Delete this file? This cannot be undone.')) {
      e.preventDefault();
    }
  };

  return (
    <form action={action}>
      <button
        type="submit"
        onClick={handleClick}
        disabled={pending}
        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-950 disabled:opacity-50"
        title="Delete file"
      >
        {pending ? (
          <Icon>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </Icon>
        ) : (
          <Icon>
            <Trash2 className="h-3.5 w-3.5" />
          </Icon>
        )}
      </button>
    </form>
  );
}

