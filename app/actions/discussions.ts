'use server';

import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ThreadSchema = z.object({
  projectId: z.string(),
  title: z.string().min(5).max(120),
  body: z.string().min(5).max(2000),
});

export async function createDiscussionThread(formData: FormData) {
  const user = await requireUser();
  const parsed = ThreadSchema.safeParse({
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    body: formData.get('body'),
  });
  if (!parsed.success) return { error: 'Invalid input' };

  const thread = await prisma.discussionThread.create({
    data: { ...parsed.data, authorId: user.id },
  });

  const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
  revalidatePath(`/projects/${project!.slug}`);
  return { success: true, threadId: thread.id };
}

const ReplySchema = z.object({
  threadId: z.string(),
  body: z.string().min(1).max(1500),
});

export async function postDiscussionReply(formData: FormData) {
  const user = await requireUser();
  const parsed = ReplySchema.safeParse({
    threadId: formData.get('threadId'),
    body: formData.get('body'),
  });
  if (!parsed.success) return { error: 'Invalid input' };

  const thread = await prisma.discussionThread.findUnique({
    where: { id: parsed.data.threadId },
    include: { project: true },
  });
  if (!thread) return { error: 'Thread not found' };

  await prisma.discussionReply.create({
    data: { body: parsed.data.body, threadId: parsed.data.threadId, authorId: user.id },
  });

  revalidatePath(`/projects/${thread.project.slug}`);
  return { success: true };
}

export async function deleteDiscussionThread(threadId: string) {
  const user = await requireUser();
  if (user.role !== 'admin') return { error: 'Only admins.' };
  await prisma.discussionThread.delete({ where: { id: threadId } });
  return { success: true };
}

export async function deleteDiscussionReply(replyId: string) {
  const user = await requireUser();
  if (user.role !== 'admin') return { error: 'Only admins.' };
  await prisma.discussionReply.delete({ where: { id: replyId } });
  return { success: true };
}
