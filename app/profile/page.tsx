import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';

export default async function ProfileRedirect() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  redirect(`/users/${user.username}`);
}
