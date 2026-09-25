export default function AdminBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold bg-orange-500 text-white ${sizeClasses[size]}`}
    >
      ADMIN
    </span>
  );
}
