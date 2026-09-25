import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'nautilus_session';
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  // Simple secure-enough token for demo (in prod use proper signed JWT or opaque + DB lookup)
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = generateToken();

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (token) {
      // Clean up
      await prisma.session.deleteMany({ where: { token } });
      cookieStore.delete(SESSION_COOKIE);
    }
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
