import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';
import FileTree from '@/app/components/FileTree';
import FileUploader from '@/app/components/FileUploader';
import { ArrowLeft, Upload } from 'lucide-react';

export default async function ProjectFilesPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      owner: { username },
    },
    include: {
      owner: { select: { username: true, id: true } },
      files: { orderBy: { updatedAt: 'desc' } },
    },
  });

  if (!project) notFound();

  const isOwnerOrContributor =
    user?.id === project.ownerId ||
    user?.role === 'admin' ||
    project.contributors?.some((c: any) => c.id === user?.id);

  if (!project.isPublic && !isOwnerOrContributor) {
    notFound();
  }

  const isOwner = user?.id === project.ownerId;
  const totalSize = project.files.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href={`/${username}/${projectSlug}`}
            className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to project
          </Link>

          <h1 className="text-3xl font-semibold mt-3 tracking-tight">Files</h1>
          <p className="text-zinc-500 mt-1">
            {project.files.length} file{project.files.length === 1 ? '' : 's'} •{' '}
            {totalSize > 0 ? `${Math.round(totalSize / 1024 / 1024)} MB` : '0 MB'}
          </p>
        </div>

        {isOwner && (
          <Link
            href={`/${username}/${projectSlug}`}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
          >
            <Upload className="h-4 w-4" /> Upload from project page
          </Link>
        )}
      </div>

      {project.files.length === 0 ? (
        <div className="border border-zinc-800 rounded-2xl p-12 text-center bg-zinc-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
            <Upload className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium">No files yet</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            Upload files or folders from the project page to get started. Folders with more than 3 files will appear here.
          </p>
          {isOwner && (
            <Link
              href={`/${username}/${projectSlug}`}
              className="mt-6 inline-flex btn-primary px-6 py-2 text-sm"
            >
              Go to project
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900 py-2">
          <FileTree
            files={project.files.map(f => ({
              name: f.name,
              size: f.size || undefined,
              updatedAt: f.updatedAt,
              id: f.id,
            }))}
            isOwner={isOwner}
            basePath={`/${username}/${projectSlug}/files`}
            onDelete={async (fileId: string) => {
              'use server';
              const { deleteProjectFile } = await import('@/app/actions/files');
              await deleteProjectFile(fileId, project.slug);
            }}
          />
        </div>
      )}

      <div className="mt-8 text-xs text-zinc-500">
        Tip: Folders containing 3 or fewer files expand directly on the project page. Larger folders open here.
      </div>
    </div>
  );
}
