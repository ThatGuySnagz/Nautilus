import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import AdminBadge from '@/app/components/AdminBadge';

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: {
      author: {
        username: {
          not: 'Nautilus',
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      author: {
        select: { username: true, role: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 text-zinc-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Blogs</h1>
          <p className="text-zinc-400 mt-1">Long-form writing from the community</p>
        </div>
        <Link
          href="/blogs/new"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Write a Blog
        </Link>
      </div>

      {blogs.length > 0 ? (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.author.username}/${blog.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="font-semibold text-xl tracking-tight text-zinc-100">{blog.title}</div>
              <div className="mt-1 text-sm text-zinc-400 flex items-center gap-1.5">
                by {blog.author.username}
                {blog.author.role === 'admin' && <AdminBadge size="sm" />}
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
          <p className="text-zinc-400">No blogs yet. Be the first to write one!</p>
          <Link href="/blogs/new" className="mt-4 inline-block text-orange-600 hover:underline">
            Start writing →
          </Link>
        </div>
      )}
    </div>
  );
}
