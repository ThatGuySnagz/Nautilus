/**
 * One-time helper script to ensure the "Snagz" admin account exists.
 * 
 * Run this if the normal seed isn't creating the account because you already have data in the DB.
 * 
 * Usage:
 *   npx tsx scripts/ensure-snagz.ts
 */

import { prisma } from '../app/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const username = 'Snagz';
  const email = 'Snagz@nautilus.dev';
  const password = 'password123';

  console.log(`Ensuring user "${username}" exists as admin...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      password: passwordHash,
      role: 'admin',
    },
    create: {
      username,
      email,
      password: passwordHash,
      role: 'admin',
      bio: 'Demo admin account. Use this for testing moderation tools, admin actions, and privileged features.',
      showEmail: true,
    },
  });

  console.log(`✅ User "${username}" is ready.`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('Error ensuring Snagz account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
