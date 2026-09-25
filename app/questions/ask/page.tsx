import { askQuestion } from '@/app/actions/questions';
import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import Link from 'next/link';

export default async function AskPage() {
  await requireUser(); // will redirect if not logged in
  const projects = await prisma.project.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/questions" className="text-sm text-orange-600 hover:underline">← Back to questions</Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Ask a public question</h1>
        <p className="text-sm text-zinc-500">Get help from the community. You can link it to one of your projects.</p>
      </div>

      <form action={askQuestion as any} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            name="title"
            required
            minLength={10}
            maxLength={150}
            placeholder="How do I properly configure Prisma client in Next.js App Router?"
            className="form-input text-base"
          />
          <p className="text-xs text-zinc-400 mt-1">Be specific and imagine you’re asking another developer.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Body</label>
          <textarea
            name="body"
            required
            minLength={20}
            rows={8}
            placeholder="Describe what you've tried, what you expected, and what actually happened..."
            className="form-input font-mono text-sm resize-y min-h-[140px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
            <input
              name="tags"
              placeholder="nextjs, prisma, sqlite"
              className="form-input"
            />
            <p className="text-xs text-zinc-400 mt-1">Up to 5 tags. Helps others find your question.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Link to project (optional)</label>
            <select name="projectId" className="form-input">
              <option value="">No project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary px-8">Post your question</button>
          <Link href="/questions" className="ml-3 text-sm text-zinc-500 hover:text-zinc-700">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
