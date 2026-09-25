import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

type FeedItem = {
  id: string;
  type: 'question' | 'project' | 'blog';
  title: string;
  description?: string;
  href: string;
  createdAt: Date;
  author?: string;
};

export default async function HomeFeed() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  // Fetch recent items
  const [questions, projects, blogs] = await Promise.all([
    prisma.question.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true } },
      },
    }),
    prisma.project.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { username: true } },
      },
    }),
    prisma.blog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true } },
      },
    }),
  ]);

  const feed: FeedItem[] = [
    ...questions.map((q) => ({
      id: q.id,
      type: 'question' as const,
      title: q.title,
      description: q.body.substring(0, 120) + (q.body.length > 120 ? '...' : ''),
      href: `/questions/${q.id}`,
      createdAt: q.createdAt,
      author: q.author.username,
    })),
    ...projects.map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      description: p.description.substring(0, 120) + (p.description.length > 120 ? '...' : ''),
      href: `/projects/${p.slug}`,
      createdAt: p.createdAt,
      author: p.owner.username,
    })),
    ...blogs.map((b) => ({
      id: b.id,
      type: 'blog' as const,
      title: b.title,
      description: b.body.substring(0, 120) + (b.body.length > 120 ? '...' : ''),
      href: `/blogs/${b.author?.username || 'unknown'}/${b.id}`, // adjust if route differs
      createdAt: b.createdAt,
      author: b.author.username,
    })),
  ];

  // Sort by newest
  feed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getTypeBadge = (type: FeedItem['type']) => {
    const styles = {
      question: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      project: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
      blog: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    };
    const labels = {
      question: 'Question',
      project: 'Project',
      blog: 'Blog',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Home Feed</h1>
        <p className="text-zinc-500 mt-1">Latest questions, projects, and blogs from the community</p>
      </div>

      <div className="space-y-4">
        {feed.length > 0 ? (
          feed.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="block rounded-xl border border-zinc-200 bg-white p-6 hover:border-orange-300 transition-colors dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    {getTypeBadge(item.type)}
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h2>
                  </div>
                  {item.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-zinc-500">
                    by {item.author} · {item.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-500">
            No content yet. Start by asking a question or creating a project!
          </div>
        )}
      </div>
    </div>
  );
}
