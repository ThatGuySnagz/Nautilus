import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function BlogDashboard() {
  const user = await requireUser();

  const myBlogs = await prisma.blog.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Blog Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your personal blogs</p>
        </div>
        <Link
          href="/blogs/new/create"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Write a new blog
        </Link>
      </div>

      {myBlogs.length > 0 ? (
        <div className="space-y-4">
          {myBlogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${user.username}/${blog.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-6 hover:border-orange-200 transition-colors dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="font-semibold text-xl">{blog.title}</div>
              <div className="mt-1 text-sm text-zinc-500">
                {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
              </div>
              <div className="mt-3 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {blog.body.substring(0, 200)}
                {blog.body.length > 200 && '...'}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500 mb-4">You haven&apos;t written any blogs yet.</p>
          <Link
            href="/blogs/new/create"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Write your first blog
          </Link>
        </div>
      )}
    </div>
  );
}
