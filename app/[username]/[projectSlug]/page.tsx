import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import {
  createDiscussionThread,
  postDiscussionReply,
  deleteProject,
  deleteDiscussionThread,
  deleteDiscussionReply,
} from '@/app/actions/discussions';
import {
  uploadProjectFile,
  deleteProjectFile,
} from '@/app/actions/files';
import AdminBadge from '@/app/components/AdminBadge';
import AdminDeleteButton from '@/app/components/AdminDeleteButton';
import FileUploader from '@/app/components/FileUploader';
import DeleteProjectFileButton from '@/app/components/DeleteProjectFileButton';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import READMEEditor from '@/app/components/READMEEditor';
import ProjectSidebar from '@/app/components/ProjectSidebar';
import FileTree from '@/app/components/FileTree';
import { getAbsoluteFilePath } from '@/app/lib/file-storage';

export default async function NamespacedProjectDetailPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      owner: {
        username: username,
      },
    },
    include: {
      owner: { select: { username: true, id: true, role: true } },
      contributors: { select: { id: true } },
      discussionThreads: {
        select: {
          id: true,
          title: true,
          body: true,
          createdAt: true,
          author: { select: { username: true, role: true } },
          replies: {
            select: {
              id: true,
              body: true,
              createdAt: true,
              author: {
                select: { username: true, role: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      files: { orderBy: { updatedAt: 'desc' } },
      questions: {
        take: 4,
        include: { author: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
      },
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

  const readmeFile = project.files.find((f) => {
    const lower = f.name.toLowerCase();
    return lower === 'readme.md' || lower === 'readme' || lower === 'readme.txt';
  });

  let readmeContent: string | null = null;

  if (readmeFile) {
    if (readmeFile.content) {
      readmeContent = readmeFile.content;
    } else if (readmeFile.path) {
      try {
        const fullPath = getAbsoluteFilePath(readmeFile.path);
        readmeContent = await readFile(fullPath, 'utf-8');
      } catch (e) {
        console.error('Failed to read README from disk:', e);
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href={`/users/${username}`} className="text-sm text-orange-600 hover:underline">
          ← Back to @{username}
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight mt-2">{project.name}</h1>
        {project.description && (
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* README Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-zinc-100">README</h2>
              {isOwner && readmeFile && (
                <READMEEditor projectId={project.id} initialContent={readmeContent || ''} />
              )}
            </div>
            <div className="prose prose-invert max-w-none border border-zinc-800 rounded-2xl p-8 bg-zinc-900">
              {readmeContent ? (
                <MarkdownRenderer content={readmeContent} />
              ) : (
                <div className="text-sm text-zinc-400">No README yet.</div>
              )}
            </div>
          </div>

          {/* Discussions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-zinc-100">Discussions</h2>
              {user && (
                <form action={createDiscussionThread} className="w-full max-w-md space-y-2">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input
                    name="title"
                    placeholder="Discussion title"
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                    required
                  />
                  <textarea
                    name="body"
                    placeholder="Write your discussion..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 resize-y"
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary text-sm px-5 py-1.5">Post Discussion</button>
                  </div>
                </form>
              )}
            </div>

            {project.discussionThreads.length > 0 ? (
              <div className="space-y-4">
                {project.discussionThreads.map((thread) => (
                  <div key={thread.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-900">
                    <div className="font-medium text-zinc-100">{thread.title}</div>
                    <div className="text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                      by {thread.author.username}
                      {thread.author.role === 'admin' && <AdminBadge size="sm" />}
                      • {new Date(thread.createdAt).toLocaleDateString()}
                    </div>
                    {thread.body && (
                      <div className="mt-3 text-sm text-zinc-300 line-clamp-3">
                        {thread.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 text-sm">No discussions yet.</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-zinc-100">Files</h2>
                <Link
                  href={`/${username}/${projectSlug}/files`}
                  className="text-xs text-orange-600 hover:underline"
                >
                  See all
                </Link>
              </div>
              {isOwner && (
                <div className="mt-2">
                  <FileUploader projectId={project.id} />
                </div>
              )}
            </div>

            <FileTree
              files={project.files.map(f => ({
                name: f.name,
                size: f.size || undefined,
                updatedAt: f.updatedAt,
                id: f.id
              }))}
              isOwner={isOwner}
              basePath={`/${username}/${projectSlug}/files`}
              onDelete={async (fileId: string) => {
                'use server';
                await deleteProjectFile(fileId, project.slug);
              }}
            />
          </div>

          <ProjectSidebar project={project} files={project.files} />
        </div>
      </div>
    </div>
  );
}
