import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { updatePrivacySettings, updateProjectVisibility } from '@/app/actions/user';
import ProjectVisibilityCheckbox from '@/app/components/ProjectVisibilityCheckbox';
import Link from 'next/link';

export default async function PrivacySettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      showOnProfile: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Email Privacy */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Privacy</h2>
        <form action={updatePrivacySettings} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="showEmail"
              name="showEmail"
              defaultChecked={user.showEmail}
              className="mt-1 h-4 w-4 accent-orange-500"
            />
            <div>
              <label htmlFor="showEmail" className="font-medium cursor-pointer text-zinc-900 dark:text-zinc-100">
                Show email on my public profile
              </label>
              <p className="text-sm text-zinc-500 mt-1">
                When enabled, your email address will be visible to anyone who visits your profile.
              </p>
            </div>
          </div>
          <button type="submit" className="mt-6 btn-primary">
            Save Privacy Settings
          </button>
        </form>
      </section>

      {/* Projects on Profile */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Projects on Profile</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Choose which of your projects appear on your public profile.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {projects.length > 0 ? (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {projects.map((project) => (
                <form
                  key={project.id}
                  action={updateProjectVisibility}
                  className="flex items-center justify-between p-4"
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-medium hover:text-orange-600 text-zinc-900 dark:text-zinc-100"
                  >
                    {project.name}
                  </Link>
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-zinc-900 dark:text-zinc-100">
                    Show on profile
                    <ProjectVisibilityCheckbox
                      projectId={project.id}
                      initialChecked={project.showOnProfile}
                    />
                  </label>
                </form>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-zinc-500">
              You don&apos;t have any projects yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
