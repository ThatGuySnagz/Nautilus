import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Ensuring demo accounts exist...');

  // Helper to create or update a demo user with a known password
  async function ensureDemoUser(username: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.upsert({
      where: { username },
      update: {
        email,
        password: passwordHash, // Always reset to the known demo password
      },
      create: {
        username,
        email,
        password: passwordHash,
      },
    });
  }

  // Handle rename of old alice_dev demo account to Snagz (if it still exists)
  const oldAlice = await prisma.user.findUnique({ where: { username: 'alice_dev' } });
  if (oldAlice) {
    await prisma.user.update({
      where: { id: oldAlice.id },
      data: {
        username: 'Snagz',
        email: 'Snagz@nautilus.dev',
      },
    });
  }

  // Always ensure these demo accounts exist with correct passwords
  const admin = await ensureDemoUser('Admin', 'admin@nautilus.dev', 'admin123');
  const snagz = await ensureDemoUser('Snagz', 'Snagz@nautilus.dev', 'password123');
  const bob = await ensureDemoUser('bob_codes', 'bob_codes@example.com', 'password123');
  const charlie = await ensureDemoUser('charlie_js', 'charlie_js@example.com', 'password123');

  // Always ensure Admin has the correct role and bio (even if content already exists)
  await prisma.user.update({
    where: { username: 'Admin' },
    data: {
      role: 'admin',
      bio: 'Official account for the Nautilus team. We build tools that help developers collaborate without switching between Stack Overflow and GitHub.',
      showEmail: true,
    },
  });

  // Ensure Snagz is also an admin account
  await prisma.user.update({
    where: { username: 'Snagz' },
    data: {
      role: 'admin',
      bio: 'Demo admin account. Use this for testing moderation tools, admin actions, and privileged features.',
      showEmail: true,
    },
  });

  // Only seed rich demo content (projects, questions, etc.) if the database is empty
  const existingProject = await prisma.project.findFirst();
  if (existingProject) {
    console.log('Demo content already exists, skipping full seed.');
    console.log('Demo accounts ready:');
    console.log('  Admin (admin) / admin123');
    console.log('  Snagz (admin) / password123');
    console.log('  bob_codes / password123');
    console.log('  charlie_js / password123');
    return;
  }

  console.log('Seeding full demo content...');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'nextjs' } }),
    prisma.tag.create({ data: { name: 'react' } }),
    prisma.tag.create({ data: { name: 'typescript' } }),
    prisma.tag.create({ data: { name: 'prisma' } }),
    prisma.tag.create({ data: { name: 'sqlite' } }),
    prisma.tag.create({ data: { name: 'tailwind' } }),
  ]);

  const tagMap = Object.fromEntries(tags.map(t => [t.name, t.id]));

  // Create Projects (tied community forums)
  const project1 = await prisma.project.create({
    data: {
      slug: 'nautilus-forum',
      name: 'Nautilus Forum',
      description: 'A hybrid platform combining Stack Overflow style Q&A with per-project discussion forums. Built to keep developers in one place.',
      ownerId: snagz.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      slug: 'devtools-cli',
      name: 'DevTools CLI',
      description: 'A powerful command-line toolkit for modern web developers. Includes generators, linters, and deployment helpers.',
      ownerId: bob.id,
    },
  });

  // Seed some files for projects
  await prisma.projectFile.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'README.md',
        content: '# Nautilus\n\nThe future of developer collaboration.\n\n## Features\n- Global Q&A\n- Per-project discussions\n- No context switching',
      },
      {
        projectId: project1.id,
        name: 'ROADMAP.md',
        content: '## Roadmap\n\n- [x] Core Q&A\n- [x] Project forums\n- [ ] Real-time updates\n- [ ] Git integration',
      },
      {
        projectId: project2.id,
        name: 'README.md',
        content: '# DevTools CLI\n\nnpm install -g @devtools/cli\n\n## Usage\n\n```bash\ndev new my-app\ndev build\ndev deploy\n```',
      },
    ],
  });

  // Create Discussion threads for projects (GitHub Discussions style)
  const thread1 = await prisma.discussionThread.create({
    data: {
      title: 'How should we handle authentication in v2?',
      body: 'I think we should move to JWT + refresh tokens for better security and scalability. What does everyone think?',
      projectId: project1.id,
      authorId: bob.id,
    },
  });

  await prisma.discussionReply.createMany({
    data: [
      {
        body: 'Strongly agree on JWTs. We already use them in other services.',
        threadId: thread1.id,
        authorId: snagz.id,
      },
      {
        body: 'What about session cookies for better CSRF protection out of the box?',
        threadId: thread1.id,
        authorId: charlie.id,
      },
    ],
  });

  const thread2 = await prisma.discussionThread.create({
    data: {
      title: 'Proposal: Add plugin system for custom commands',
      body: 'A plugin architecture would let the community extend the CLI without us maintaining everything.',
      projectId: project2.id,
      authorId: snagz.id,
    },
  });

  await prisma.discussionReply.create({
    data: {
      body: 'Love this idea. I have a few commands I would love to publish as plugins.',
      threadId: thread2.id,
      authorId: bob.id,
    },
  });

  // Create global StackOverflow-style Questions
  const q1 = await prisma.question.create({
    data: {
      title: 'How to properly set up Prisma with SQLite in a Next.js 16 app?',
      body: 'I am trying to use the new Prisma client generator output in app/generated/prisma but getting module resolution issues. Any examples for app dir + server actions?',
      authorId: charlie.id,
      projectId: project1.id, // linked
    },
  });

  await prisma.questionTag.createMany({
    data: [
      { questionId: q1.id, tagId: tagMap.prisma },
      { questionId: q1.id, tagId: tagMap.sqlite },
      { questionId: q1.id, tagId: tagMap.nextjs },
    ],
  });

  const q2 = await prisma.question.create({
    data: {
      title: 'Best way to implement upvoting without duplicate votes per user?',
      body: 'I have a Vote model with unique constraints but in SQLite the partial unique indexes behave unexpectedly with nullable columns. Looking for a clean pattern.',
      authorId: snagz.id,
    },
  });

  await prisma.questionTag.createMany({
    data: [
      { questionId: q2.id, tagId: tagMap.prisma },
      { questionId: q2.id, tagId: tagMap.typescript },
    ],
  });

  // Answers
  const a1 = await prisma.answer.create({
    data: {
      body: 'The recommended approach now is to keep the datasource url ONLY in prisma.config.ts (Prisma 6/7+). Then import the generated client from the custom output path. Make sure you have a singleton in lib/prisma.ts to avoid multiple instances during dev.',
      questionId: q1.id,
      authorId: snagz.id,
    },
  });

  await prisma.answer.create({
    data: {
      body: 'Also run `npx prisma generate` after every schema change and restart your dev server. The new client is much smaller!',
      questionId: q1.id,
      authorId: bob.id,
    },
  });

  // Some votes
  await prisma.vote.createMany({
    data: [
      { userId: snagz.id, questionId: q1.id, value: 1 },
      { userId: bob.id, questionId: q1.id, value: 1 },
      { userId: charlie.id, answerId: a1.id, value: 1 },
      { userId: snagz.id, questionId: q2.id, value: 1 },
    ],
  });

  // More questions for feed
  const q3 = await prisma.question.create({
    data: {
      title: 'Tailwind v4 @theme inline not applying custom fonts properly',
      body: 'I followed the docs but my Geist font variables are not being picked up in some components. Dark mode also seems inconsistent.',
      authorId: bob.id,
    },
  });

  await prisma.questionTag.create({
    data: { questionId: q3.id, tagId: tagMap.tailwind },
  });

  console.log('Seeding complete!');
  console.log('Demo accounts ready (username or email):');
  console.log('  Admin      / admin@nautilus.dev       password: admin123   ← Recommended for testing');
  console.log('  Snagz (admin) / Snagz@nautilus.dev    password: password123');
  console.log('  bob_codes  / bob_codes@example.com   password: password123');
  console.log('  charlie_js / charlie_js@example.com  password: password123');
}
