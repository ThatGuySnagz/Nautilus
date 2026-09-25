'use client';

import { useFormStatus } from 'react-dom';
import { LogOut, Loader2 } from 'lucide-react';
import Icon from './Icon';
import { logout } from '@/app/actions/auth';

export default function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <form action={logout}>
      <button
        type="submit"
        disabled={pending}
        className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Log out"
      >
        {pending ? (
          <Icon>
            <Loader2 className="h-4 w-4 animate-spin" />
          </Icon>
        ) : (
          <Icon>
            <LogOut className="h-4 w-4" />
          </Icon>
        )}
      </button>
    </form>
  );
}
