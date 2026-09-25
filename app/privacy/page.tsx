import { getCurrentUser } from '@/app/lib/auth';

export default async function PrivacyPolicy() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-zinc-100">
      <h1 className="text-4xl font-semibold tracking-tight mb-6">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300">
        <p>Last updated: June 2026</p>
        
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, 
          post content, or communicate with us.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to operate, maintain, and improve our services, 
          and to communicate with you.
        </p>

        <h2>Sharing of Information</h2>
        <p>
          We do not share your personal information with third parties except as described in this policy.
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
