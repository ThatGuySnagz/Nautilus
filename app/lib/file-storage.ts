import fs from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'project-files');
const AVATAR_DIR = path.join(process.cwd(), 'data', 'avatars');

// Maximum file size for experimentation phase (5MB)
// TODO: This limit is temporary for the current experimentation phase.
// We will likely need to increase it (or make it configurable per project/plan) in the future.
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Avatar limits and allowed types
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB - reasonable for profile pictures
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

/**
 * Maps mime type to a safe file extension for avatars.
 */
function getAvatarExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}

/**
 * Ensures the base upload directory exists.
 */
async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Generates a safe storage path for a file within a project.
 * Preserves folder structure (e.g. src/components/Button.tsx)
 */
export function getProjectFilePath(projectId: string, filename: string): string {
  // Sanitize each path segment but keep the folder structure
  const safeFilename = filename
    .split('/')
    .map(segment => segment.replace(/[^a-zA-Z0-9._-]/g, '_'))
    .join('/');

  return path.join(UPLOAD_DIR, projectId, safeFilename);
}

/**
 * Saves a file buffer to disk for a given project.
 * Returns the relative storage path.
 */
export async function saveFileToDisk(
  projectId: string,
  originalName: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ path: string; size: number }> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB during this experimentation phase.`);
  }

  await ensureUploadDir();

  const projectDir = path.join(UPLOAD_DIR, projectId);
  await fs.mkdir(projectDir, { recursive: true });

  const filePath = getProjectFilePath(projectId, originalName);

  // Ensure parent directories exist for nested paths
  const parentDir = path.dirname(filePath);
  await fs.mkdir(parentDir, { recursive: true });

  await fs.writeFile(filePath, buffer);

  return {
    path: path.relative(UPLOAD_DIR, filePath),
    size: buffer.length,
  };
}

/**
 * Deletes a file from disk.
 */
export async function deleteFileFromDisk(relativePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, relativePath);
  try {
    await fs.unlink(fullPath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    // File already doesn't exist - that's fine
  }
}

/**
 * Gets the full absolute path for serving a file.
 */
export function getAbsoluteFilePath(relativePath: string): string {
  return path.join(UPLOAD_DIR, relativePath);
}

// ==================== AVATAR STORAGE ====================

async function ensureAvatarDir(userId: string) {
  const userAvatarDir = path.join(AVATAR_DIR, userId);
  await fs.mkdir(userAvatarDir, { recursive: true });
}

/**
 * Saves an avatar image for a user.
 * Always normalizes the filename to "avatar.<ext>" for clean serving.
 * Returns the relative path (e.g. "userId/avatar.jpg").
 */
export async function saveAvatarToDisk(
  userId: string,
  buffer: Buffer,
  mimeType: AllowedAvatarMimeType
): Promise<{ path: string; size: number }> {
  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new Error(`Avatar too large. Maximum size is ${MAX_AVATAR_SIZE / (1024 * 1024)}MB.`);
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(mimeType as any)) {
    throw new Error('Invalid image type. Please upload a JPG, PNG, WebP, or GIF.');
  }

  await ensureAvatarDir(userId);
  const ext = getAvatarExtension(mimeType);
  const filename = `avatar.${ext}`;
  const fullPath = path.join(AVATAR_DIR, userId, filename);

  await fs.writeFile(fullPath, buffer);

  return {
    path: `${userId}/${filename}`,
    size: buffer.length,
  };
}

/**
 * Deletes a previously stored avatar from disk.
 */
export async function deleteAvatarFromDisk(relativePath: string): Promise<void> {
  if (!relativePath) return;
  const fullPath = path.join(AVATAR_DIR, relativePath);
  try {
    await fs.unlink(fullPath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 * Gets the absolute path for serving an avatar.
 */
export function getAbsoluteAvatarPath(relativePath: string): string {
  return path.join(AVATAR_DIR, relativePath);
}
