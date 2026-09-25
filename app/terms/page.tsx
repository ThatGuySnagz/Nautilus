import { getCurrentUser } from '@/app/lib/auth';

export default async function TermsOfService() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-zinc-100">
      <h1 className="text-4xl font-semibold tracking-tight mb-6">Terms of Service</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300">
        <p>Last updated: June 2026</p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using Nautilus, you agree to be bound by these Terms of Service.
        </p>

        <h2>Your Content</h2>
        <p>
          You retain ownership of any content you post. By posting, you grant us a license to display and distribute it.
        </p>

        <h2>Prohibited Conduct</h2>
        <p>
          You may not use Nautilus for any illegal or unauthorized purpose.
        </p>
      </div>

      {isAdmin && (
        <div className="mt-10 p-4 border border-zinc-800 rounded-lg bg-zinc-900">
          <p className="text-sm text-orange-400">Admin: This page is editable by admins only.</p>
          <button className="mt-2 text-sm text-orange-500 hover:underline">Edit this page →</button>
        </div>
      )}
    </div>
  );
}
