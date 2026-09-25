'use client';

import { useCallback, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, FolderOpen } from 'lucide-react';
import Icon from './Icon';

interface FileUploaderProps {
  projectId: string;
}

interface FileWithPath {
  file: File;
  relativePath: string;
}

export default function FileUploader({ projectId }: FileUploaderProps) {
  const [isPending, startTransition] = useTransition();

  const uploadFiles = async (fileItems: FileWithPath[]) => {
    if (fileItems.length === 0) return;

    const filtered = fileItems.filter(
      ({ relativePath }) => !relativePath.includes('.DS_Store')
    );

    if (filtered.length === 0) return;

    const formData = new FormData();
    formData.append('projectId', projectId);

    // Send files and their paths separately (most reliable method for Next.js server actions)
    filtered.forEach(({ file, relativePath }) => {
      formData.append('file', file);
      formData.append('path', relativePath);
    });

    startTransition(async () => {
      const { uploadProjectFile } = await import('@/app/actions/files');
      const result = await uploadProjectFile(formData);

      if (result?.success) {
        toast.success(`Uploaded ${filtered.length} file(s)`);
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const fileItems: FileWithPath[] = acceptedFiles.map((file) => ({
      file,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));
    uploadFiles(fileItems);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleUploadFolder = async () => {
    try {
      // @ts-ignore
      if (!window.showDirectoryPicker) {
        toast.error('Your browser does not support folder uploads (use Chrome/Edge).');
        return;
      }

      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      const collected: FileWithPath[] = [];

      const walk = async (handle: any, pathPrefix = '') => {
        for await (const [name, entry] of handle.entries()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            collected.push({ file, relativePath: pathPrefix + name });
          } else if (entry.kind === 'directory') {
            await walk(entry, pathPrefix + name + '/');
          }
        }
      };

      await walk(dirHandle);

      if (collected.length > 0) {
        uploadFiles(collected);
      } else {
        toast.info('No files found in the selected folder.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to read folder');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileItems: FileWithPath[] = Array.from(selectedFiles).map((file) => ({
      file,
      relativePath: (file as any).webkitRelativePath || file.name,
    }));

    uploadFiles(fileItems);
    e.target.value = '';
  };

  return (
    <div className="mt-2 space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer text-sm ${
          isDragActive
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
            : 'border-zinc-700 hover:border-orange-400'
        }`}
      >
        <input {...getInputProps()} />
        {!isPending ? (
          <>
            <Icon>
              <Upload className="mx-auto h-5 w-5 text-zinc-400 mb-1" />
            </Icon>
            <p className="text-xs text-zinc-400">
              Drag & drop files/folders here, or{' '}
              <label className="cursor-pointer text-orange-600 hover:text-orange-500 font-medium">
                browse
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
          </>
        ) : (
          <div className="text-sm text-orange-600">Uploading...</div>
        )}
      </div>

      <button
        onClick={handleUploadFolder}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        <FolderOpen className="h-4 w-4" />
        Upload Folder (Recommended)
      </button>
    </div>
  );
}
