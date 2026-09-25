import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserBlogsPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      blogs: {
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
        <h1 className="text-3xl font-semibold tracking-tight mt-2">Blogs by @{username}</h1>
      </div>

      {user.blogs.length > 0 ? (
        <div className="space-y-6">
          {user.blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blogs/${username}/${blog.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="font-semibold text-xl text-zinc-100 line-clamp-2">{blog.title}</div>
              <p className="mt-3 text-sm text-zinc-400 line-clamp-3">
                {blog.body.substring(0, 200)}{blog.body.length > 200 && '...'}
              </p>
              <div className="mt-4 text-xs text-zinc-400">
                Published {new Date(blog.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">@{username} hasn&apos;t written any blogs yet.</p>
        </div>
      )}
    </div>
  );
}
