import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { ArrowRight, MessageCircle, Users, FolderOpen } from 'lucide-react';
import Icon from '@/app/components/Icon';
import { seedDatabase } from '@/app/lib/seed';

async function ensureSeed() {
  try {
    const count = await prisma.question.count();
    if (count === 0) {
      await seedDatabase();
    }
  } catch (error: any) {
    // Handle case where tables don't exist yet (common after deleting DB or first run)
    if (error.message?.includes('does not exist') || error.code === 'P2021') {
      console.log('Database tables not found. Please run: npx prisma db push');
      // Don't crash the page — just show a friendly message on the landing page
    } else {
      console.error('Seeding error:', error);
    }
  }
}

export default async function Home() {
  // Auto-seed on first visit for great first experience
  await ensureSeed();

  let questionCount = 0;
  let projectCount = 0;
  let userCount = 0;
  let recentQuestions: any[] = [];
  let recentProjects: any[] = [];

  try {
    [questionCount, projectCount, userCount, recentQuestions, recentProjects] = await Promise.all([
      prisma.question.count(),
      prisma.project.count(),
      prisma.user.count(),
      prisma.question.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { username: true } }, tags: { include: { tag: true } } },
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { username: true } }, _count: { select: { discussionThreads: true } } },
      }),
    ]);
  } catch (error: any) {
    // Graceful fallback when database isn't set up yet
    if (error.message?.includes('does not exist') || error.code === 'P2021') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-3">Database not set up yet</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              The database tables haven&apos;t been created. Run this command in your terminal:
            </p>
            <div className="bg-zinc-900 text-green-400 font-mono text-sm p-4 rounded-lg mb-6 text-left">
              npx prisma db push
            </div>
            <p className="text-sm text-zinc-500">
              Then refresh this page. The demo data will be seeded automatically.
            </p>
          </div>
        </div>
      );
    }
    throw error;
  }

  return (
    <div>
      {/* Hero */}
      <div className="border-b border-zinc-200 bg-[#f5f0e6] dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-zinc-500 mb-4 dark:border-zinc-800">
            ONE PLATFORM • TWO WORKFLOWS
          </div>
          <h1 className="text-5xl font-semibold tracking-tighter sm:text-6xl">
            Questions and project<br />discussions in one place.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            The best of Stack Overflow and GitHub Discussions combined.
            No more context switching between apps.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/questions" className="btn-primary px-8 py-3 text-base">
              Browse Questions <Icon><ArrowRight className="h-4 w-4" /></Icon>
            </Link>
            <Link href="/projects" className="btn-secondary px-8 py-3 text-base">
              Explore Projects
            </Link>
          </div>

          <div className="mt-10 flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon><Users className="h-4 w-4" /></Icon> {userCount} developers
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon><MessageCircle className="h-4 w-4" /></Icon> {questionCount} questions
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon><FolderOpen className="h-4 w-4" /></Icon> {projectCount} projects
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Recent Questions */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg tracking-tight">Latest Questions</h2>
              <Link href="/questions" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                View all <Icon><ArrowRight className="h-3.5 w-3.5" /></Icon>
              </Link>
            </div>

            <div className="space-y-3">
              {recentQuestions.length > 0 ? recentQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="question-card block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="font-medium leading-snug line-clamp-2">{q.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <span>by {q.author.username}</span>
                    <span>•</span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    {q.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {q.tags.slice(0, 2).map((qt: { tag: { id: string; name: string } }) => (
                            <span key={qt.tag.id} className="tag text-[10px]">{qt.tag.name}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-zinc-500">No questions yet.</div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg tracking-tight">Active Projects</h2>
              <Link href="/projects" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                All projects <Icon><ArrowRight className="h-3.5 w-3.5" /></Icon>
              </Link>
            </div>

            <div className="space-y-3">
              {recentProjects.length > 0 ? recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="project-card block rounded-xl border border-zinc-200 bg-[#faf7f2] p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-zinc-600 line-clamp-2 mt-1 dark:text-zinc-400">{p.description}</div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>by {p.owner.username}</span>
                    <span className="flex items-center gap-1"><Icon><MessageCircle className="h-3 w-3" /></Icon> {p._count.discussionThreads} discussions</span>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-zinc-500">No projects yet.</div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-500">Have a side project? Start a dedicated discussion space for it in seconds.</p>
              <Link href="/projects" className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline">Create your first project →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value props */}
      <div className="border-t border-zinc-200 bg-[#f5f0e6] dark:border-zinc-800 dark:bg-zinc-950 py-12">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-1">Ask once, get answers fast</div>
            <p className="text-zinc-600 dark:text-zinc-400">Global Q&amp;A with voting, tags, and the ability to attach questions directly to your projects.</p>
          </div>
          <div>
            <div className="font-semibold mb-1">Project-native discussions</div>
            <p className="text-zinc-600 dark:text-zinc-400">Every project gets its own lightweight forum. No Discord. No separate GitHub. Just context-rich conversations.</p>
          </div>
          <div>
            <div className="font-semibold mb-1">Stay in flow</div>
            <p className="text-zinc-600 dark:text-zinc-400">One login. One mental model. Code, ask, discuss, and ship without leaving the tab.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
