import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import { updateProfile } from '@/app/actions/user';
import AvatarUploader from '@/app/components/AvatarUploader';

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Account Information</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Username</label>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Email</label>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.email}</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Username and email cannot be changed in this demo.
          </p>
        </div>
      </section>

      {/* Profile Picture */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Profile Picture</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <AvatarUploader
            userId={user.id}
            username={user.username}
            currentAvatarUrl={user.avatarUrl}
            role={user.role}
          />
        </div>
      </section>

      {/* Profile Settings */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Profile</h2>
        <form action={updateProfile} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={user.bio || ''}
              rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              placeholder="Tell people about yourself..."
            />
          </div>
          <button type="submit" className="mt-4 btn-primary">
            Save Bio
          </button>
        </form>
      </section>
    </div>
  );
}
