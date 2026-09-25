import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';
import {
  updateProjectMetadata,
  addProjectContributor,
  removeProjectContributor,
} from '@/app/actions/projects';
import DeleteProjectButton from '@/app/components/DeleteProjectButton';

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;
  const user = await getCurrentUser();

  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      owner: { username },
    },
    include: {
      owner: { select: { username: true, id: true } },
      contributors: {
        select: { id: true, username: true },
      },
    },
  });

  if (!project) notFound();

  const isOwner = user?.id === project.ownerId;
  const isAdmin = user?.role === 'admin';

  if (!isOwner && !isAdmin) {
    redirect(`/${username}/${projectSlug}`);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <Link
          href={`/${username}/${projectSlug}`}
          className="text-sm text-orange-600 hover:underline"
        >
          ← Back to project
        </Link>
        <h1 className="text-3xl font-semibold mt-2">Project Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage {project.name}
        </p>
      </div>

      {/* Metadata Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Project Details</h2>
        <form action={updateProjectMetadata} className="space-y-4">
          <input type="hidden" name="projectId" value={project.id} />

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={project.name}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-950 dark:border-zinc-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={project.description || ''}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-950 dark:border-zinc-700 h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug</label>
              <input
                type="text"
                name="slug"
                defaultValue={project.slug}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-950 dark:border-zinc-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  defaultChecked={project.isPublic}
                  className="w-4 h-4"
                />
                <span className="text-sm">Public project</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary px-6 py-2 text-sm mt-2"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Contributors */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Contributors</h2>

        <form action={addProjectContributor} className="flex gap-2 mb-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input
            type="text"
            name="username"
            placeholder="Username to add"
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-950 dark:border-zinc-700"
            required
          />
          <button type="submit" className="btn-primary px-4 text-sm">
            Add
          </button>
        </form>

        <div className="space-y-2">
          {project.contributors.length > 0 ? (
            project.contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2"
              >
                <div>
                  <div className="font-medium">{contributor.username}</div>
                </div>
                <form action={removeProjectContributor}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="contributorId" value={contributor.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">No additional contributors yet.</p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-2 text-red-600">Danger Zone</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Deleting a project is permanent and cannot be undone.
        </p>
        <DeleteProjectButton projectId={project.id} projectSlug={project.slug} />
      </div>
    </div>
  );
}
