import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar';
import AdminBadge from '@/app/components/AdminBadge';
import ActivityTabs from './ActivityTabs';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      ownedProjects: {
        take: 3,
        include: {
          _count: {
            select: { discussionThreads: true, questions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      blogs: {
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
      questions: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { slug: true, owner: { select: { username: true } } } } },
      },
      answers: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          question: {
            select: {
              id: true,
              title: true,
              project: { select: { slug: true, owner: { select: { username: true } } } },
            },
          },
        },
      },
      discussionThreads: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { slug: true, owner: { select: { username: true } } } } },
      },
      discussionReplies: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          thread: {
            select: {
              id: true,
              title: true,
              project: { select: { slug: true, owner: { select: { username: true } } } },
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  // Build unified activity feed
  type ActivityItem = {
    type: 'question' | 'answer' | 'discussion' | 'discussion_reply' | 'blog';
    title: string;
    href: string;
    date: Date;
    subtitle?: string;
  };

  const activities: ActivityItem[] = [];

  // Posts
  user.questions.forEach((q) => {
    activities.push({
      type: 'question',
      title: q.title,
      href: q.project
        ? `/${q.project.owner.username}/${q.project.slug}/questions/${q.id}`
        : `/questions/${q.id}`,
      date: q.createdAt,
      subtitle: 'asked a question',
    });
  });

  user.discussionThreads.forEach((t) => {
    activities.push({
      type: 'discussion',
      title: t.title,
      href: t.project
        ? `/${t.project.owner.username}/${t.project.slug}#discussions`
        : '#',
      date: t.createdAt,
      subtitle: 'started a discussion',
    });
  });

  user.blogs.forEach((b) => {
    activities.push({
      type: 'blog',
      title: b.title,
      href: `/blogs/${username}/${b.id}`,
      date: b.createdAt,
      subtitle: 'published a blog',
    });
  });

  // Replies
  user.answers.forEach((a) => {
    if (a.question) {
      activities.push({
        type: 'answer',
        title: a.question.title,
        href: a.question.project
          ? `/${a.question.project.owner.username}/${a.question.project.slug}/questions/${a.question.id}`
          : `/questions/${a.question.id}`,
        date: a.createdAt,
        subtitle: 'answered a question',
      });
    }
  });

  user.discussionReplies.forEach((r) => {
    if (r.thread) {
      activities.push({
        type: 'discussion_reply',
        title: r.thread.title,
        href: r.thread.project
          ? `/${r.thread.project.owner.username}/${r.thread.project.slug}#discussions`
          : '#',
        date: r.createdAt,
        subtitle: 'replied to a discussion',
      });
    }
  });

  // Sort by date (newest first)
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Separate Posts and Replies
  const posts = activities.filter(a => ["question", "discussion", "blog"].includes(a.type));
  const replies = activities.filter(a => ["answer", "discussion_reply"].includes(a.type));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start gap-6">
        <UserAvatar
          username={user.username}
          avatarUrl={user.avatarUrl}
          role={user.role}
          size="lg"
        />

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{user.username}</h1>
            {user.role === 'admin' && <AdminBadge />}
          </div>

          {user.name && <div className="text-lg text-zinc-400 mt-0.5">{user.name}</div>}

          {user.bio && (
            <p className="mt-4 max-w-2xl text-zinc-300">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <div className="mt-12">
        <h2 className="font-semibold text-xl mb-6">Activity</h2>
        <ActivityTabs posts={posts} replies={replies} />
      </div>

      {/* Projects & Blogs */}
      <div className="mt-14 grid md:grid-cols-2 gap-8">
        {/* Projects */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold text-lg">Projects</h2>
            <Link href={`/users/${username}/projects`} className="text-sm text-orange-600 hover:underline">View all →</Link>
          </div>

          {user.ownedProjects.length > 0 ? (
            <div className="space-y-4">
              {user.ownedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${username}/${project.slug}`}
                  className="project-card block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="font-semibold text-lg text-zinc-100">{project.name}</div>
                  <p className="text-sm text-zinc-400 line-clamp-2 mt-1.5">{project.description}</p>
                  <div className="mt-4 flex gap-4 text-xs text-zinc-400">
                    <span>{project._count.discussionThreads} discussions</span>
                    <span>{project._count.questions} questions</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
              This user hasn&apos;t created any projects yet.
            </div>
          )}
        </div>

        {/* Blogs */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold text-lg">Blogs</h2>
            <Link href={`/users/${username}/blogs`} className="text-sm text-orange-600 hover:underline">View all →</Link>
          </div>

          {user.blogs.length > 0 ? (
            <div className="space-y-4">
              {user.blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${username}/${blog.id}`}
                  className="project-card block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
                >
                  <div className="font-semibold text-lg text-zinc-100 line-clamp-2">{blog.title}</div>
                  <p className="text-sm text-zinc-400 line-clamp-2 mt-1.5">
                    {blog.body.substring(0, 140)}{blog.body.length > 140 && '...'}
                  </p>
                  <div className="mt-9 flex gap-4 text-xs text-zinc-400">
                    <span>Published {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-400">
              This user hasn&apos;t written any blogs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
