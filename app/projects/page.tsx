import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { Plus } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { getCurrentUser } from '@/app/lib/auth';
import AdminBadge from '@/app/components/AdminBadge';

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { isPublic: true },
        user ? { ownerId: user.id } : undefined,
        user ? { contributors: { some: { id: user.id } } } : undefined,
      ].filter(Boolean) as any,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { username: true, role: true } },
      _count: { select: { discussionThreads: true, files: true, questions: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500">Dedicated community discussion spaces for each project</p>
        </div>
        {user && (
          <Link href="/projects/new" className="btn-primary">
            <Icon><Plus className="h-4 w-4" /></Icon> New Project
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/${p.owner.username}/${p.slug}`}
            className="project-card group block rounded-2xl border border-zinc-200 bg-[#faf7f2] p-5 hover:border-orange-200 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="font-semibold text-lg group-hover:text-orange-600 transition-colors text-zinc-900 dark:text-zinc-100">{p.name}</div>
            <div className="text-sm text-zinc-600 line-clamp-3 mt-1.5 dark:text-zinc-400">{p.description}</div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                by <span className="font-medium text-zinc-700 dark:text-zinc-300">{p.owner.username}</span>
                {p.owner.role === 'admin' && <AdminBadge size="sm" />}
              </div>
              <div className="flex gap-3">
                <span>{p._count.discussionThreads} discussions</span>
                <span>{p._count.questions} questions</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-zinc-500">No projects yet. Create one to start a community space.</div>
      )}
    </div>
  );
}
