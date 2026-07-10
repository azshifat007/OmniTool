'use client';

import Link from 'next/link';

export default function TiltCard({ href, children }) {
  return (
    <Link href={href} className="no-underline block group">
      <div className="bg-surface rounded-2xl border border-border card-hover cursor-pointer h-full glass-card">
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 transition-all duration-300" />
        <div className="p-5">
          {children}
        </div>
      </div>
    </Link>
  );
}
