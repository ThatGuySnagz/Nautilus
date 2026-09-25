import { ReactNode } from 'react';

interface IconProps {
  children: ReactNode;
}

/**
 * Small wrapper around icon SVGs (primarily Lucide) to suppress
 * hydration warnings caused by browser extensions like Dark Reader.
 *
 * These extensions inject `data-darkreader-*` attributes and inline styles
 * into <svg> elements after the server HTML is sent but before React hydrates.
 */
export default function Icon({ children }: IconProps) {
  return <span suppressHydrationWarning>{children}</span>;
}
