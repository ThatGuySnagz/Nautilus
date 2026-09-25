'use client';

import { useState, useTransition } from 'react';
import { uploadAvatar, removeAvatar } from '@/app/actions/user';
import { toast } from 'sonner';
import UserAvatar from './UserAvatar';

interface AvatarUploaderProps {
  userId: string;
  username: string;
  currentAvatarUrl?: string | null;
  role?: string;
}

export default function AvatarUploader({
  userId,
  username,
  currentAvatarUrl,
  role,
}: AvatarUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    startTransition(async () => {
      const result = await uploadAvatar(formData);

      if (result?.success) {
        toast.success('Profile picture updated');
        setSelectedFile(null);
        setPreviewUrl(null);
        // The revalidate will cause a refresh of the server component
        window.location.reload();
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  const handleRemove = async () => {
    if (!confirm('Remove your profile picture?')) return;

    startTransition(async () => {
      const result = await removeAvatar();

      if (result?.success) {
        toast.success('Profile picture removed');
        setSelectedFile(null);
        setPreviewUrl(null);
        window.location.reload();
      } else {
        toast.error('Failed to remove profile picture');
      }
    });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const displayAvatar = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      {/* Current / Preview Avatar */}
      <div className="flex flex-col items-center gap-2">
        <UserAvatar
          username={username}
          avatarUrl={displayAvatar}
          role={role}
          size="xl"
        />
        <div className="text-xs text-zinc-500 text-center">
          {previewUrl ? 'Preview' : 'Current'}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {!selectedFile ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Change profile picture
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="block w-full text-sm text-zinc-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-orange-500 file:text-white
                  hover:file:bg-orange-600
                  cursor-pointer"
              />
              <p className="mt-1 text-xs text-zinc-500">
                JPG, PNG, WebP or GIF. Max 2MB.
              </p>
            </div>

            {/* Prominent remove option when a picture exists */}
            {currentAvatarUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                Remove profile picture
              </button>
            )}
          </>
        ) : (
          <div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              Ready to upload new picture
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isPending}
                className="btn-primary text-sm px-6 py-2"
              >
                {isPending ? 'Uploading...' : 'Save new picture'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="btn-secondary text-sm px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
