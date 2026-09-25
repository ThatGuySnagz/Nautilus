'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/settings/account', label: 'Account' },
  { href: '/settings/appearance', label: 'Appearance' },
  { href: '/settings/privacy', label: 'Privacy' },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
