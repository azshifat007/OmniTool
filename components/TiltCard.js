'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const accentColors = {
  Text: 'bg-cat-text', PDF: 'bg-cat-pdf', Document: 'bg-cat-document',
  Code: 'bg-cat-code', Security: 'bg-cat-security', Design: 'bg-cat-design',
  Date: 'bg-cat-date', Media: 'bg-cat-media', Math: 'bg-cat-math',
  Network: 'bg-cat-network', DevOps: 'bg-cat-devops', Fun: 'bg-cat-fun',
  System: 'bg-cat-system',
};

const iconColors = {
  Text: 'text-cat-text', PDF: 'text-cat-pdf', Document: 'text-cat-document',
  Code: 'text-cat-code', Security: 'text-cat-security', Design: 'text-cat-design',
  Date: 'text-cat-date', Media: 'text-cat-media', Math: 'text-cat-math',
  Network: 'text-cat-network', DevOps: 'text-cat-devops', Fun: 'text-cat-fun',
  System: 'text-cat-system',
};

const catStyles = {
  Text: 'bg-cat-text/10 text-cat-text border-cat-text/20',
  PDF: 'bg-cat-pdf/10 text-cat-pdf border-cat-pdf/20',
  Document: 'bg-cat-document/10 text-cat-document border-cat-document/20',
  Code: 'bg-cat-code/10 text-cat-code border-cat-code/20',
  Security: 'bg-cat-security/10 text-cat-security border-cat-security/20',
  Design: 'bg-cat-design/10 text-cat-design border-cat-design/20',
  Date: 'bg-cat-date/10 text-cat-date border-cat-date/20',
  Media: 'bg-cat-media/10 text-cat-media border-cat-media/20',
  Math: 'bg-cat-math/10 text-cat-math border-cat-math/20',
  Network: 'bg-cat-network/10 text-cat-network border-cat-network/20',
  DevOps: 'bg-cat-devops/10 text-cat-devops border-cat-devops/20',
  Fun: 'bg-cat-fun/10 text-cat-fun border-cat-fun/20',
  System: 'bg-cat-system/10 text-cat-system border-cat-system/20',
};

export default function TiltCard({ href, cat, icon, title, children }) {
  const accent = accentColors[cat] || 'bg-primary';
  const iconColor = iconColors[cat] || 'text-text-tertiary';
  const badge = catStyles[cat] || 'bg-badge-bg text-text-tertiary border-border';

  return (
    <Link href={href} className="no-underline block group">
      <div className="relative bg-surface rounded-2xl border border-border cursor-pointer h-full overflow-hidden">
        <div className={cn(
          "opacity-0 group-hover:opacity-100 transition duration-200 absolute inset-0 h-full w-full pointer-events-none",
          "bg-gradient-to-b from-neutral-100/60 to-transparent dark:from-neutral-800/60"
        )} />
        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between mb-4">
            <span className={cn("text-3xl transition-colors duration-200", iconColor)}>
              {icon}
            </span>
            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", badge)}>
              {cat}
            </span>
          </div>
          <div className="relative">
            <div className={cn(
              "absolute left-0 inset-y-0 h-6 group-hover:h-8 w-1 rounded-tr-full rounded-br-full transition-all duration-200 origin-center",
              accent
            )} />
            <h3 className="font-heading text-base font-semibold text-text mb-1.5 group-hover:translate-x-2 transition-transform duration-200">
              {title}
            </h3>
          </div>
          <div className="text-sm text-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </Link>
  );
}
