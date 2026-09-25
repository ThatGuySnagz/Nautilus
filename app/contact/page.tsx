import { getCurrentUser } from '@/app/lib/auth';

export default async function ContactPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-zinc-100">
      <h1 className="text-4xl font-semibold tracking-tight mb-6">Contact Us</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300">
        <p>
          Have questions, feedback, or need help? We’d love to hear from you.
        </p>

        <h2>Get in Touch</h2>
        <p>
          You can reach us at <a href="mailto:hello@nautilus.dev" className="text-orange-500">hello@nautilus.dev</a>.
        </p>

        <h2>Feedback</h2>
        <p>
          Found a bug or have a feature request? Please open an issue on our GitHub or use the in-app feedback form.
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
