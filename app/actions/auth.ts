'use server';

import { prisma } from '@/app/lib/prisma';
import { hashPassword, verifyPassword, createSession, logout as logoutAction } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const RegisterSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(_prevState: any, formData: FormData) {
  const raw = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'Invalid input. Username 3-20 alphanum/_, valid email, password >=6 chars.' };
  }

  const { username, email, password } = parsed.data;

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return { error: 'Email or username already taken.' };
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  await createSession(user.id);

  redirect('/');
}

export async function login(_prevState: any, formData: FormData) {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'Please provide valid email and password.' };
  }

  const { email, password } = parsed.data;

  // Allow login with either email or username
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findUnique({ where: { username: email } });
  }

  if (!user) {
    return { error: 'Invalid email/username or password.' };
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return { error: 'Invalid email/username or password.' };
  }

  await createSession(user.id);
  redirect('/');
}

export async function logout() {
  await logoutAction();
  redirect('/login');
}
