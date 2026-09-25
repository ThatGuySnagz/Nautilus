import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-zinc-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Nautilus. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="hover:text-zinc-300 transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact</Link>
            <Link href="/blogs/Nautilus" className="hover:text-zinc-300 transition-colors">Blog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
