import { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { getAbsoluteFilePath } from '@/app/lib/file-storage';
import { prisma } from '@/app/lib/prisma';

// Basic file serving for uploaded project files.
// For a production app you would add proper authz here.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const relativePath = path.join('/');

  try {
    const fullPath = getAbsoluteFilePath(relativePath);
    const fileBuffer = await readFile(fullPath);

    // Basic content type detection
    const mimeType = 'application/octet-stream'; // Can be improved later

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${path[path.length - 1]}"`,
      },
    });
  } catch (error) {
    return new Response('File not found', { status: 404 });
  }
}
