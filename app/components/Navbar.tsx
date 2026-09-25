import Link from 'next/link';
import { getCurrentUser } from '@/app/lib/auth';
import LogoutButton from './LogoutButton';
import UserAvatar from './UserAvatar';
import AdminBadge from './AdminBadge';
import { Plus, Search } from 'lucide-react';
import Icon from './Icon';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={user ? "/home" : "/"} className="flex items-center gap-2 font-semibold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                N
              </div>
              <span>Nautilus</span>
            </Link>

            <div className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/questions" className="px-3 py-1.5 rounded-md hover:bg-zinc-800 font-medium transition-colors">Questions</Link>
              <Link href="/projects" className="px-3 py-1.5 rounded-md hover:bg-zinc-800 font-medium transition-colors">Projects</Link>
              <Link href="/blogs" className="px-3 py-1.5 rounded-md hover:bg-zinc-800 font-medium transition-colors">Blogs</Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 rounded-full border border-zinc-800 bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <Icon><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" /></Icon>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/questions/ask" className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
                  <Icon><Plus className="h-4 w-4" /></Icon>
                  Ask
                </Link>
                <Link href="/projects/new" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-zinc-800 border-zinc-800">New Project</Link>
                <Link href="/blogs/new" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-zinc-800 border-zinc-800">Blog Dashboard</Link>

                <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
                  <Link href={`/users/${user.username}`} className="flex items-center gap-2.5 group">
                    <UserAvatar username={user.username} avatarUrl={user.avatarUrl} role={user.role} size="sm" />
                    <div className="hidden sm:block text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm font-medium group-hover:text-orange-600 transition-colors">
                        {user.username}
                        {user.role === 'admin' && <AdminBadge size="sm" />}
                      </div>
                    </div>
                  </Link>
                  <Link href="/settings" className="text-xs px-2.5 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 font-medium">Settings</Link>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-1.5 text-sm font-medium hover:bg-zinc-800 rounded-md transition-colors">Log in</Link>
                <Link href="/register" className="px-4 py-1.5 rounded-full bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
