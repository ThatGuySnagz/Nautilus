'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectReadme } from '@/app/actions/projects';
import { toast } from 'sonner';

interface READMEEditorProps {
  projectId: string;
  initialContent: string;
}

export default function READMEEditor({ projectId, initialContent }: READMEEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProjectReadme(projectId, content);
    setIsSaving(false);

    if (result?.success) {
      toast.success('README updated');
      setIsEditing(false);
      router.refresh(); // re-fetch server data so the new README content appears
    } else {
      toast.error(result?.error || 'Failed to save README');
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-orange-600 hover:underline"
      >
        Edit README
      </button>
    );
  }

  return (
    <div className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 font-mono text-sm p-4 border rounded dark:bg-zinc-950 dark:border-zinc-700"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary text-sm px-4 py-1.5"
        >
          {isSaving ? 'Saving...' : 'Save README'}
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setContent(initialContent);
          }}
          className="btn-secondary text-sm px-4 py-1.5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
