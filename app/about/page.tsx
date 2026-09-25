import { getCurrentUser } from '@/app/lib/auth';
import Link from 'next/link';

export default async function AboutPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-zinc-100">
      <h1 className="text-4xl font-semibold tracking-tight mb-6">About Nautilus</h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300">
        <p>
          Nautilus is a hybrid platform that combines the best of Stack Overflow and GitHub Discussions.
          It was built to keep developers in one place — asking questions, sharing knowledge, and collaborating on projects without context switching.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          We believe developers should be able to ask questions, share long-form thoughts, and collaborate on projects in a single, unified experience.
        </p>

        <h2>Who We Are</h2>
        <p>
          Nautilus was created by developers who were tired of juggling multiple tools. 
          We wanted one place to ask, discuss, and build — together.
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
