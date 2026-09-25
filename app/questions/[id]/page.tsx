import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';
import { postAnswer, deleteQuestion } from '@/app/actions/questions';
import { VoteButtons } from '@/app/components/VoteButtons';
import AdminBadge from '@/app/components/AdminBadge';
import AdminDeleteButton from '@/app/components/AdminDeleteButton';

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, role: true } },
      tags: { include: { tag: true } },
      project: { select: { id: true, slug: true, name: true } },
      answers: {
        include: {
          author: { select: { id: true, username: true, role: true } },
          votes: { select: { userId: true, value: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      votes: { select: { userId: true, value: true } },
    },
  });

  if (!question) notFound();

  // Compute scores
  const qScore = question.votes.reduce((s, v) => s + v.value, 0);
  const userQVote = question.votes.find(v => v.userId === user?.id)?.value as 1 | -1 | undefined || 0;

  const answersWithScore = question.answers.map(a => ({
    ...a,
    score: a.votes.reduce((s, v) => s + v.value, 0),
    userVote: a.votes.find(v => v.userId === user?.id)?.value as 1 | -1 | undefined || 0,
  }));

  // Sort answers: accepted would be first, then by score. For MVP just newest or score desc
  answersWithScore.sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <Link href="/questions" className="text-sm text-orange-600 hover:underline">← All questions</Link>
      </div>

      <div className="flex gap-5">
        {/* Vote column */}
        <VoteButtons
          target="question"
          targetId={question.id}
          score={qScore}
          userVote={userQVote}
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight">{question.title}</h1>

          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            Asked {new Date(question.createdAt).toLocaleDateString()} by{' '}
            <Link href={`/users/${question.author.username}`} className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-orange-600 hover:underline">{question.author.username}</Link>{question.author.role === 'admin' && <span className="ml-1.5"><AdminBadge size="sm" /></span>}
            {question.project && (
              <>
                {' '}in{' '}
                <Link href={`/projects/${question.project.slug}`} className="font-medium text-orange-600 hover:underline">
                  {question.project.name}
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {question.tags.map((qt) => (
                <span key={qt.tag.id} className="tag">{qt.tag.name}</span>
              ))}
            </div>
          )}

          {/* Admin actions */}
          {user?.role === 'admin' && (
            <div className="mt-4 flex gap-2">
              <form action={async () => {
                'use server';
                await deleteQuestion(question.id);
              }}>
                <AdminDeleteButton 
                  confirmMessage="Delete this question? This cannot be undone." 
                  label="Delete Question (Admin)" 
                  className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950" 
                />
              </form>
            </div>
          )}

          {/* Body */}
          <div className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
            {question.body}
          </div>

          {/* Answers header */}
          <div className="mt-10 border-t pt-6">
            <div className="font-semibold text-lg mb-4">
              {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
            </div>

            {answersWithScore.length === 0 && (
              <p className="text-sm text-zinc-500 italic">No answers yet. Be the first to help!</p>
            )}

            <div className="space-y-6">
              {answersWithScore.map((ans) => (
                <div key={ans.id} className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <VoteButtons
                    target="answer"
                    targetId={ans.id}
                    score={ans.score}
                    userVote={ans.userVote}
                  />
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{ans.body}</div>
                    <div className="mt-3 text-xs text-zinc-500">
                      answered by <Link href={`/users/${ans.author.username}`} className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-orange-600 hover:underline">{ans.author.username}</Link>{ans.author.role === 'admin' && <span className="ml-1.5"><AdminBadge size="sm" /></span>} · {new Date(ans.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post answer form */}
          {user ? (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-2">Your answer</h3>
              <form action={postAnswer as any} className="space-y-3">
                <input type="hidden" name="questionId" value={question.id} />
                <textarea
                  name="body"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Write a clear, helpful answer..."
                  className="form-input resize-y"
                />
                <button type="submit" className="btn-primary">Post Answer</button>
              </form>
            </div>
          ) : (
            <div className="mt-8 text-sm border rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
              <Link href="/login" className="text-orange-600 font-medium">Log in</Link> to post an answer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
