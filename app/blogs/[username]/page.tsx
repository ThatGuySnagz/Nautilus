import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';
import AdminBadge from '@/app/components/AdminBadge';

export default async function UserBlogsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      blogs: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 text-zinc-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{user.username}'s Blogs</h1>
          <p className="text-zinc-400 mt-1">All long-form writing by {user.username}</p>
        </div>
        <Link
          href="/blogs"
          className="text-sm text-orange-600 hover:underline"
        >
          ← All blogs
        </Link>
      </div>

      {user.blogs.length > 0 ? (
        <div className="space-y-4">
          {user.blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${username}/${blog.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="font-semibold text-xl tracking-tight text-zinc-100">{blog.title}</div>
              <div className="mt-1 text-sm text-zinc-400 flex items-center gap-1.5">
                by {user.username}
                {user.role === 'admin' && <AdminBadge size="sm" />}
                • {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </div>
              <div className="mt-3 text-zinc-300 line-clamp-3">
                {blog.body.substring(0, 280)}
                {blog.body.length > 280 && '...'}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">{user.username} hasn&apos;t written any blogs yet.</p>
        </div>
      )}
    </div>
  );
}
