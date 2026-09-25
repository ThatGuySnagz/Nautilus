'use server';

import { prisma } from '@/app/lib/prisma';
import { getCurrentUser, requireUser } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  saveAvatarToDisk,
  deleteAvatarFromDisk,
  MAX_AVATAR_SIZE,
  ALLOWED_AVATAR_MIME_TYPES,
} from '@/app/lib/file-storage';

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const bio = formData.get('bio') as string | null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: bio?.trim() || null,
    },
  });

  revalidatePath(`/users/${user.username}`);
  revalidatePath('/settings');
}

export async function updatePrivacySettings(formData: FormData) {
  const user = await requireUser();

  const showEmail = formData.get('showEmail') === 'on';

  await prisma.user.update({
    where: { id: user.id },
    data: { showEmail },
  });

  revalidatePath(`/users/${user.username}`);
  revalidatePath('/settings');
}

export async function updateProjectVisibility(formData: FormData) {
  const user = await requireUser();

  const projectId = formData.get('projectId') as string;
  const showOnProfile = formData.get('showOnProfile') === 'on';

  // Security: only allow owner to change their own project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project || project.ownerId !== user.id) {
    // Silently ignore unauthorized attempts in demo
    return;
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { showOnProfile },
  });

  revalidatePath(`/users/${user.username}`);
  revalidatePath('/settings');
}

// ==================== AVATAR ACTIONS ====================

export async function uploadAvatar(formData: FormData) {
  const user = await requireUser();

  const file = formData.get('avatar') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please select an image to upload.' };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return {
      error: `Image is too large. Maximum size is ${MAX_AVATAR_SIZE / (1024 * 1024)}MB.`,
    };
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as any)) {
    return {
      error: 'Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.',
    };
  }

  try {
    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old avatar if one exists
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    if (currentUser?.avatarUrl) {
      await deleteAvatarFromDisk(currentUser.avatarUrl);
    }

    // Save the new avatar
    const { path } = await saveAvatarToDisk(user.id, buffer, file.type as any);

    // Update the user record
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: path },
    });

    revalidatePath('/settings');
    revalidatePath(`/users/${user.username}`);
    revalidatePath('/'); // In case avatar appears in navbar on home

    return { success: true };
  } catch (error: any) {
    console.error('Avatar upload failed:', error);
    return { error: error.message || 'Failed to upload avatar.' };
  }
}

export async function removeAvatar() {
  const user = await requireUser();

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });

  if (currentUser?.avatarUrl) {
    await deleteAvatarFromDisk(currentUser.avatarUrl);

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
    });

    revalidatePath('/settings');
    revalidatePath(`/users/${user.username}`);
    revalidatePath('/');
  }

  return { success: true };
}
