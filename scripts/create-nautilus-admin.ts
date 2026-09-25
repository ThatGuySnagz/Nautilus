import { prisma } from '../app/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = 'pass123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'Nautilus@nautilus.dev' },
    update: {
      username: 'Nautilus',
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      username: 'Nautilus',
      email: 'Nautilus@nautilus.dev',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log(`   Username: ${user.username}`);
  console.log(`   Email:    ${user.email}`);
  console.log(`   Role:     ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
