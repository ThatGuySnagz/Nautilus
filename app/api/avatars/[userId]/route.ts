import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAbsoluteAvatarPath } from '@/app/lib/file-storage';
import { readFile } from 'node:fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (!user?.avatarUrl) {
    return new Response('Avatar not found', { status: 404 });
  }

  try {
    const fullPath = getAbsoluteAvatarPath(user.avatarUrl);
    const fileBuffer = await readFile(fullPath);

    // Determine content type from file extension
    const ext = user.avatarUrl.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' :
      ext === 'gif' ? 'image/gif' :
      'image/jpeg';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      },
    });
  } catch (error) {
    console.error('Failed to serve avatar:', error);
    return new Response('Avatar not found', { status: 404 });
  }
}
