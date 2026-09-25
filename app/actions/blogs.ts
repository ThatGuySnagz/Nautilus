'use server';

import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const CreateBlogSchema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(20).max(50000),
});

export async function createBlog(formData: FormData) {
  const user = await requireUser();

  const parsed = CreateBlogSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { error: 'Title (3-120 chars) and body (min 20 chars) are required.' };
  }

  const { title, body } = parsed.data;

  const blog = await prisma.blog.create({
    data: {
      title,
      body,
      authorId: user.id,
    },
  });

  revalidatePath('/blogs');
  revalidatePath(`/users/${user.username}`);

  redirect(`/blogs/${user.username}/${blog.id}`);
}

export async function deleteBlog(blogId: string) {
  const user = await requireUser();

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { authorId: true },
  });

  if (!blog) {
    return { error: 'Blog not found.' };
  }

  // Only allow owner or admin to delete
  if (blog.authorId !== user.id && user.role !== 'admin') {
    return { error: 'You do not have permission to delete this blog.' };
  }

  await prisma.blog.delete({
    where: { id: blogId },
  });

  revalidatePath('/blogs');
  revalidatePath('/blogs/new');
  revalidatePath(`/users/${user.username}`);

  redirect('/blogs/new');
}
