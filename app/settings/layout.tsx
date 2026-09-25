import { getCurrentUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import SettingsNav from './SettingsNav';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 flex-shrink-0">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-2">
            <SettingsNav />
          </div>
          <p className="mt-3 px-4 text-xs text-zinc-500">
            Changes are saved automatically where applicable.
          </p>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
