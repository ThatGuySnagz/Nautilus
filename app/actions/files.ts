'use server';

import { prisma } from '@/app/lib/prisma';
import { requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import { saveFileToDisk, deleteFileFromDisk } from '@/app/lib/file-storage';

export async function uploadProjectFile(formData: FormData) {
  const user = await requireUser();
  const projectId = formData.get('projectId') as string;
  const files = formData.getAll('file') as File[];
  const paths = formData.getAll('path') as string[];

  console.log('[uploadProjectFile] Received files:', files.map((f, i) => ({
    name: f.name,
    path: paths[i],
    size: f.size
  })));

  if (!projectId || files.length === 0) {
    return { error: 'Project ID and at least one file are required.' };
  }

  const proj = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, slug: true, ownerId: true },
  });

  if (!proj) return { error: 'Project not found.' };
  if (proj.ownerId !== user.id) return { error: 'Only the project owner can upload files.' };

  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = paths[i] || file.name;

    try {
      console.log('[uploadProjectFile] Processing file with path:', relativePath);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { path, size } = await saveFileToDisk(
        projectId,
        relativePath,
        buffer,
        file.type || 'application/octet-stream'
      );

      await prisma.projectFile.create({
        data: {
          projectId,
          name: relativePath,
          path,
          size,
          mimeType: file.type || 'application/octet-stream',
          content: file.size < 100 * 1024 && file.type?.startsWith('text/')
            ? buffer.toString('utf-8')
            : null,
        },
      });

      results.push({ success: true, name: relativePath });
    } catch (error: any) {
      console.error('[uploadProjectFile] Error with file:', file.name, error);
      results.push({ success: false, name: file.name, error: error.message });
    }
  }

  revalidatePath(`/projects/${proj.slug}`);
  return { success: true, results };
}

export async function deleteProjectFile(fileId: string, projectSlug: string) {
  const user = await requireUser();
  const file = await prisma.projectFile.findUnique({
    where: { id: fileId },
    select: { path: true, project: { select: { ownerId: true } } },
  });
  if (!file) return { error: 'File not found.' };
  if (file.project.ownerId !== user.id) return { error: 'Not authorized.' };
  if (file.path) await deleteFileFromDisk(file.path);
  await prisma.projectFile.delete({ where: { id: fileId } });
  revalidatePath(`/projects/${projectSlug}`);
  return { success: true };
}
