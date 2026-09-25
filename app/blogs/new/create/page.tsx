import { createBlog } from '@/app/actions/blogs';
import { requireUser } from '@/app/lib/auth';
import Link from 'next/link';

export default async function CreateBlogPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/blogs/new" className="text-sm text-orange-600 hover:underline">← Back to dashboard</Link>

      <h1 className="text-3xl font-semibold tracking-tight mt-2">Write a new blog</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-1">Share your thoughts in long form.</p>

      <form action={createBlog as any} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            name="title"
            required
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="My thoughts on building with AI agents"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Content (Markdown supported)</label>
          <textarea
            name="body"
            required
            rows={18}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Write your blog post here..."
          />
          <p className="mt-1.5 text-xs text-zinc-500">Supports Markdown formatting.</p>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-orange-500 py-3 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Publish Blog
        </button>
      </form>
    </div>
  );
}
