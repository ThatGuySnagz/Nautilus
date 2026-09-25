import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import { formatDistanceToNow } from 'date-fns';
import AdminBadge from '@/app/components/AdminBadge';

export default async function BlogPage({
  params,
}: {
  params: Promise<{ username: string; blogId: string }>;
}) {
  const { username, blogId } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: {
      author: {
        select: { username: true, role: true },
      },
    },
  });

  if (!blog || blog.author.username.toLowerCase() !== username.toLowerCase()) {
    notFound();
  }

  const isCompanyAccount = blog.author.username.toLowerCase() === 'nautilus';

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-zinc-100">
      <Link href="/blogs" className="text-sm text-orange-600 hover:underline">← All blogs</Link>

      <article className="mt-6">
        <h1 className="text-4xl font-semibold tracking-tighter text-zinc-100">{blog.title}</h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <Link href={`/users/${blog.author.username}`} className="hover:text-orange-600 flex items-center gap-1.5">
            {blog.author.username}
            {blog.author.role === 'admin' && <AdminBadge size="sm" />}
          </Link>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
        </div>

        <div className="prose prose-invert max-w-none mt-8">
          <MarkdownRenderer content={blog.body} />
        </div>
      </article>

      {!isCompanyAccount && (
        <div className="mt-12 border-t border-zinc-800 pt-6 text-sm text-zinc-400">
          Written by{' '}
          <Link href={`/users/${blog.author.username}`} className="text-orange-600 hover:underline flex items-center gap-1.5 inline-flex">
            {blog.author.username}
            {blog.author.role === 'admin' && <AdminBadge size="sm" />}
          </Link>
        </div>
      )}
    </div>
  );
}
