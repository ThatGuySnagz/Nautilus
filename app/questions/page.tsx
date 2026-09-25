import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { MessageCircle, Plus } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { getCurrentUser } from '@/app/lib/auth';
import AdminBadge from '@/app/components/AdminBadge';

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort = 'new' } = await searchParams;
  const user = await getCurrentUser();

  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { body: { contains: q } },
        ],
      }
    : {};

  const orderBy: any =
    sort === 'votes'
      ? [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }]
      : { createdAt: 'desc' };

  const questions = await prisma.question.findMany({
    where,
    orderBy,
    include: {
      author: { select: { username: true, role: true } },
      tags: { include: { tag: true } },
      answers: { select: { id: true } },
      votes: { select: { value: true } },
      project: { select: { slug: true, name: true } },
    },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Questions</h1>
          <p className="text-sm text-zinc-500">Stack Overflow style — ask and answer technical questions</p>
        </div>
        <Link href="/questions/ask" className="btn-primary">
          <Icon><Plus className="h-4 w-4" /></Icon> Ask Question
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link href="/questions" className={`px-3 py-1 rounded-full ${!q && sort !== 'votes' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Newest</Link>
        <Link href="/questions?sort=votes" className={`px-3 py-1 rounded-full ${sort === 'votes' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>Highest voted</Link>
        {q && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">search: “{q}”</span>}
      </div>

      <div className="space-y-3">
        {questions.length === 0 && (
          <div className="text-center py-10 text-zinc-500">No questions found. Be the first to ask!</div>
        )}

        {questions.map((q) => {
          const score = q.votes.reduce((sum, v) => sum + v.value, 0);
          const answerCount = q.answers.length;

          return (
            <div
              key={q.id}
              className="question-card flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              {/* Score + answers */}
              <div className="w-16 flex-shrink-0 text-center pt-0.5">
                <div className="text-xl font-semibold tabular-nums tracking-tighter">{score}</div>
                <div className="text-[10px] text-zinc-500 -mt-0.5">votes</div>
                <div className={`mt-1.5 inline-flex items-center gap-1 text-xs ${answerCount > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  <Icon><MessageCircle className="h-3 w-3" /></Icon> {answerCount}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/questions/${q.id}`}
                  className="font-medium text-[15px] leading-snug pr-2 hover:text-orange-600 transition-colors"
                >
                  {q.title}
                </Link>

                <div className="mt-1.5 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400 pr-4">
                  {q.body.slice(0, 160)}{q.body.length > 160 ? '…' : ''}
                </div>

                <div className="mt-2.5 flex items-center gap-x-2 gap-y-1 flex-wrap text-xs">
                  {q.tags.map((qt) => (
                    <span key={qt.tagId} className="tag">{qt.tag.name}</span>
                  ))}
                  {q.project && (
                    <Link
                      href={`/projects/${q.project.slug}`}
                      className="tag bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 hover:bg-orange-200"
                    >
                      {q.project.name}
                    </Link>
                  )}
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">asked by <Link href={`/users/${q.author.username}`} className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-orange-600 hover:underline">{q.author.username}</Link>{q.author.role === 'admin' && <span className="ml-1"><AdminBadge size="sm" /></span>}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
