import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProjectsPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      ownedProjects: {
        include: {
          _count: {
            select: { discussionThreads: true, questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href={`/users/${username}`} className="text-sm text-orange-600 hover:underline">
          ← Back to @{username}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Projects by @{username}</h1>
      </div>

      {user.ownedProjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {user.ownedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/${username}/${project.slug}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="font-semibold text-xl text-zinc-100">{project.name}</div>
              {project.description && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-3">{project.description}</p>
              )}
              <div className="mt-4 flex gap-5 text-xs text-zinc-400">
                <span>{project._count.discussionThreads} discussions</span>
                <span>{project._count.questions} questions</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">@{username} hasn&apos;t created any projects yet.</p>
        </div>
      )}
    </div>
  );
}
