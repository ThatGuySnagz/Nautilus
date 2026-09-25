/**
 * One-time migration script
 * 
 * Merges the old 'alice_dev' demo account into 'Snagz' and deletes the old user.
 * This preserves all projects, questions, answers, discussions, and votes.
 * 
 * Usage:
 *   npx tsx scripts/merge-alice-to-snagz.ts
 */

import { prisma } from '../app/lib/prisma';

async function main() {
  const OLD_USERNAME = 'alice_dev';
  const NEW_USERNAME = 'Snagz';

  console.log('Looking for accounts...');

  const oldUser = await prisma.user.findUnique({
    where: { username: OLD_USERNAME },
    select: { id: true, username: true, email: true },
  });

  const newUser = await prisma.user.findUnique({
    where: { username: NEW_USERNAME },
    select: { id: true, username: true, email: true },
  });

  if (!oldUser) {
    console.log(`✅ No user found with username "${OLD_USERNAME}". Nothing to migrate.`);
    return;
  }

  if (!newUser) {
    console.error(`❌ User "${NEW_USERNAME}" does not exist yet.`);
    console.error('');
    console.error('Please do the following:');
    console.error('1. Make sure your dev server is running (npm run dev)');
    console.error('2. Open your browser and visit: http://localhost:3000');
    console.error('3. Wait for the page to fully load');
    console.error('4. Then run this script again.');
    console.error('');
    process.exit(1);
  }

  console.log(`\nFound:`);
  console.log(`  Old: ${oldUser.username} (${oldUser.email}) - ID: ${oldUser.id}`);
  console.log(`  New: ${newUser.username} (${newUser.email}) - ID: ${newUser.id}`);

  console.log('\nReassigning all data from old user to new user...');

  await prisma.$transaction(async (tx) => {
    // Projects (owner)
    const projectsUpdated = await tx.project.updateMany({
      where: { ownerId: oldUser.id },
      data: { ownerId: newUser.id },
    });
    console.log(`  - Projects reassigned: ${projectsUpdated.count}`);

    // Questions
    const questionsUpdated = await tx.question.updateMany({
      where: { authorId: oldUser.id },
      data: { authorId: newUser.id },
    });
    console.log(`  - Questions reassigned: ${questionsUpdated.count}`);

    // Answers
    const answersUpdated = await tx.answer.updateMany({
      where: { authorId: oldUser.id },
      data: { authorId: newUser.id },
    });
    console.log(`  - Answers reassigned: ${answersUpdated.count}`);

    // Discussion Threads
    const threadsUpdated = await tx.discussionThread.updateMany({
      where: { authorId: oldUser.id },
      data: { authorId: newUser.id },
    });
    console.log(`  - Discussion threads reassigned: ${threadsUpdated.count}`);

    // Discussion Replies
    const repliesUpdated = await tx.discussionReply.updateMany({
      where: { authorId: oldUser.id },
      data: { authorId: newUser.id },
    });
    console.log(`  - Discussion replies reassigned: ${repliesUpdated.count}`);

    // Votes
    const votesUpdated = await tx.vote.updateMany({
      where: { userId: oldUser.id },
      data: { userId: newUser.id },
    });
    console.log(`  - Votes reassigned: ${votesUpdated.count}`);

    // Delete the old user
    await tx.user.delete({
      where: { id: oldUser.id },
    });
    console.log(`  - Old user "${OLD_USERNAME}" deleted.`);
  });

  console.log('\n✅ Migration complete!');
  console.log(`All data from "${OLD_USERNAME}" has been moved to "${NEW_USERNAME}".`);
  console.log('\nYou can now safely delete this script.');
}

main()
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
