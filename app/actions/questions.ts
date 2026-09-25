'use server';

import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const AskSchema = z.object({
  title: z.string().min(10).max(150),
  body: z.string().min(20).max(5000),
  tags: z.string().optional(), // comma separated
  projectId: z.string().optional(),
});

export async function askQuestion(formData: FormData) {
  const user = await requireUser();

  const parsed = AskSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
    tags: formData.get('tags'),
    projectId: formData.get('projectId') || undefined,
  });

  if (!parsed.success) {
    return { error: 'Title (10-150 chars) and body (20+ chars) are required.' };
  }

  const { title, body, tags, projectId } = parsed.data;

  // Create or connect tags
  const tagNames = tags
    ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
    : [];

  const question = await prisma.question.create({
    data: {
      title,
      body,
      authorId: user.id,
      projectId: projectId || null,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
  });

  revalidatePath('/questions');
  revalidatePath('/');
  return { success: true, id: question.id };
}

const AnswerSchema = z.object({
  questionId: z.string(),
  body: z.string().min(10).max(3000),
});

export async function postAnswer(formData: FormData) {
  const user = await requireUser();
  const parsed = AnswerSchema.safeParse({
    questionId: formData.get('questionId'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { error: 'Answer must be at least 10 characters.' };
  }

  await prisma.answer.create({
    data: {
      body: parsed.data.body,
      questionId: parsed.data.questionId,
      authorId: user.id,
    },
  });

  revalidatePath(`/questions/${parsed.data.questionId}`);
  return { success: true };
}

export async function vote(target: 'question' | 'answer', targetId: string, value: 1 | -1) {
  const user = await requireUser();

  // Remove previous vote by this user on this target
  if (target === 'question') {
    await prisma.vote.deleteMany({ where: { userId: user.id, questionId: targetId } });
  } else {
    await prisma.vote.deleteMany({ where: { userId: user.id, answerId: targetId } });
  }

  // Create new vote (allowing change of mind by deleting then inserting)
  await prisma.vote.create({
    data: {
      userId: user.id,
      value,
      ...(target === 'question' ? { questionId: targetId } : { answerId: targetId }),
    },
  });

  // Revalidate the question page (and list if we want live scores)
  if (target === 'question') {
    revalidatePath('/questions');
    // We don't know the question id here easily for /questions/[id], caller should revalidate
  }
  return { success: true };
}

export async function deleteQuestion(questionId: string) {
  const user = await requireUser();

  if (user.role !== 'admin') {
    return { error: 'Only admins can delete questions.' };
  }

  await prisma.question.delete({ where: { id: questionId } });

  revalidatePath('/questions');
  revalidatePath('/');
  return { success: true };
}
