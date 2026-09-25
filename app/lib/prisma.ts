import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Resolve the SQLite file from DATABASE_URL
function getDatabaseFilePath() {
  const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  if (url.startsWith('file:')) {
    const filePath = url.replace('file:', '');
    return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  }
  // Fallback
  return path.join(process.cwd(), 'prisma/dev.db');
}

const dbFilePath = getDatabaseFilePath();
const dbDir = path.dirname(dbFilePath);

// Ensure the directory exists (important for prisma/dev.db)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// In development, aggressively remove journal/WAL files that can cause "readonly database" errors on macOS
if (process.env.NODE_ENV !== 'production') {
  const sidecars = [
    `${dbFilePath}-journal`,
    `${dbFilePath}-wal`,
    `${dbFilePath}-shm`,
  ];
  for (const f of sidecars) {
    try { fs.unlinkSync(f); } catch {}
  }
}

const adapter = new PrismaBetterSqlite3({ url: `file:${dbFilePath}` });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
