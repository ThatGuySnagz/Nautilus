'use server';

import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().min(10).max(500),
  slug: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
});

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const parsed = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    slug: formData.get('slug'),
  });
  if (!parsed.success) return { error: 'Invalid input' };
  const { name, description, slug } = parsed.data;
  const exists = await prisma.project.findFirst({ where: { slug, ownerId: user.id } });
  if (exists) return { error: 'Slug already exists' };
  const project = await prisma.project.create({
    data: { name, description, slug, ownerId: user.id, isPublic: true },
  });
  await prisma.projectFile.create({
    data: { projectId: project.id, name: 'README.md', content: `# ${name}\n\n${description}` },
  });
  revalidatePath('/projects');
  return { success: true, slug: project.slug };
}

export async function updateProjectMetadata(formData: FormData) {
  const user = await requireUser();
  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;
  const isPublic = formData.get('isPublic') === 'on';

  if (!projectId || !name || !description || !slug) {
    return { error: 'All fields are required.' };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true, owner: { select: { username: true } } },
  });

  if (!project) return { error: 'Project not found.' };
  if (project.ownerId !== user.id && user.role !== 'admin') {
    return { error: 'Only the project owner can update these settings.' };
  }

  if (slug !== project.slug) {
    const slugExists = await prisma.project.findFirst({
      where: {
        ownerId: project.ownerId,
        slug: slug,
        id: { not: projectId },
      },
    });
    if (slugExists) {
      return { error: 'That URL slug is already taken by one of your projects.' };
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name.trim(),
      description: description.trim(),
      slug: slug.trim(),
      isPublic,
    },
  });

  revalidatePath(`/${project.owner.username}/${project.slug}`);
  revalidatePath(`/${project.owner.username}/${slug}`);
  revalidatePath('/projects');

  if (slug !== project.slug) {
    redirect(`/${project.owner.username}/${slug}/settings`);
  }

  return { success: true };
}

export async function addProjectContributor(formData: FormData) {
  const user = await requireUser();
  const projectId = formData.get('projectId') as string;
  const username = formData.get('username') as string;

  if (!projectId || !username) return { error: 'Project ID and username are required.' };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true, owner: { select: { username: true } } },
  });

  if (!project) return { error: 'Project not found.' };
  if (project.ownerId !== user.id && user.role !== 'admin') {
    return { error: 'Only the project owner can manage contributors.' };
  }

  const contributor = await prisma.user.findUnique({
    where: { username: username.trim() },
  });

  if (!contributor) return { error: 'User not found.' };
  if (contributor.id === project.ownerId) return { error: 'The owner is already a contributor by default.' };

  await prisma.project.update({
    where: { id: projectId },
    data: {
      contributors: {
        connect: { id: contributor.id },
      },
    },
  });

  revalidatePath(`/${project.owner.username}/${project.slug}`);
  revalidatePath(`/${project.owner.username}/${project.slug}/settings`);
  return { success: true };
}

export async function removeProjectContributor(formData: FormData) {
  const user = await requireUser();
  const projectId = formData.get('projectId') as string;
  const contributorId = formData.get('contributorId') as string;

  if (!projectId || !contributorId) return { error: 'Missing data.' };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true, owner: { select: { username: true } } },
  });

  if (!project) return { error: 'Project not found.' };
  if (project.ownerId !== user.id && user.role !== 'admin') {
    return { error: 'Only the project owner can manage contributors.' };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      contributors: {
        disconnect: { id: contributorId },
      },
    },
  });

  revalidatePath(`/${project.owner.username}/${project.slug}`);
  revalidatePath(`/${project.owner.username}/${project.slug}/settings`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  if (user.role !== 'admin') return { error: 'Only admins.' };
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath('/projects');
  return { success: true };
}

export async function updateProjectReadme(projectId: string, content: string) {
  const user = await requireUser();

  if (!projectId || typeof content !== 'string') {
    return { error: 'Project ID and content are required.' };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      slug: true,
      ownerId: true,
      owner: { select: { username: true } },
      contributors: { select: { id: true } },
    },
  });

  if (!project) return { error: 'Project not found.' };

  const isOwnerOrContributor =
    project.ownerId === user.id ||
    user.role === 'admin' ||
    project.contributors.some((c) => c.id === user.id);

  if (!isOwnerOrContributor) {
    return { error: 'Only the project owner or contributors can update the README.' };
  }

  // Find README file (case-insensitive match like the page does)
  const readmeFile = await prisma.projectFile.findFirst({
    where: {
      projectId,
      OR: [
        { name: { equals: 'README.md', mode: 'insensitive' } },
        { name: { equals: 'README', mode: 'insensitive' } },
        { name: { equals: 'README.txt', mode: 'insensitive' } },
      ],
    },
  });

  if (!readmeFile) {
    return { error: 'README file not found in this project.' };
  }

  await prisma.projectFile.update({
    where: { id: readmeFile.id },
    data: { content: content.trim() },
  });

  revalidatePath(`/${project.owner.username}/${project.slug}`);

  return { success: true };
}
