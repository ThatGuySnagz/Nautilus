import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';

export default async function LegacyProjectRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Look up the project by the old global slug (for backward compat redirect)
  const project = await prisma.project.findFirst({
    where: { slug },
    select: {
      owner: {
        select: { username: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Redirect to the new namespaced URL: /username/project-slug
  redirect(`/${project.owner.username}/${slug}`);
}
