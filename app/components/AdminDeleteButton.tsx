'use client';

import { useFormStatus } from 'react-dom';

interface AdminDeleteButtonProps {
  confirmMessage: string;
  label?: string;
  className?: string;
}

export default function AdminDeleteButton({
  confirmMessage,
  label = 'Delete',
  className = 'text-[10px] text-red-500 hover:text-red-600',
}: AdminDeleteButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={pending}
      className={className}
    >
      {pending ? 'Deleting...' : label}
    </button>
  );
}
