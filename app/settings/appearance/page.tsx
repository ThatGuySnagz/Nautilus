import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function AppearanceSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Appearance</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">
            Appearance settings will be available here soon.
          </p>
        </div>
      </section>
    </div>
  );
}
