'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const accentBg = {
  Text: 'bg-cat-text', PDF: 'bg-cat-pdf', Document: 'bg-cat-document',
  Code: 'bg-cat-code', Security: 'bg-cat-security', Design: 'bg-cat-design',
  Date: 'bg-cat-date', Media: 'bg-cat-media', Math: 'bg-cat-math',
  Network: 'bg-cat-network', DevOps: 'bg-cat-devops', Fun: 'bg-cat-fun',
  System: 'bg-cat-system',
};

const iconClr = {
  Text: 'text-cat-text', PDF: 'text-cat-pdf', Document: 'text-cat-document',
  Code: 'text-cat-code', Security: 'text-cat-security', Design: 'text-cat-design',
  Date: 'text-cat-date', Media: 'text-cat-media', Math: 'text-cat-math',
  Network: 'text-cat-network', DevOps: 'text-cat-devops', Fun: 'text-cat-fun',
  System: 'text-cat-system',
};

const badgeCls = {
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

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randStr(len) {
  let r = '';
  for (let i = 0; i < len; i++) r += chars[Math.random() * chars.length | 0];
  return r;
}

function CardPattern({ mouseX, mouseY, str }) {
  const mask = useMotionTemplate`radial-gradient(300px at ${mouseX}px ${mouseY}px, white, transparent)`;
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <p className="absolute inset-x-0 top-0 text-xs leading-none break-words whitespace-pre-wrap text-primary/10 dark:text-primary/15 font-mono font-bold py-2 px-3 select-none">
          {str}
        </p>
      </motion.div>
    </div>
  );
}

export default function TiltCard({ href, cat, icon, title, children }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [str, setStr] = useState('');

  useEffect(() => { setStr(randStr(600)); }, []);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    setStr(randStr(600));
  }, [mx, my]);

  const accent = accentBg[cat] || 'bg-primary';
  const iconColor = iconClr[cat] || 'text-text-tertiary';
  const badge = badgeCls[cat] || 'bg-badge-bg text-text-tertiary border-border';

  return (
    <Link href={href} className="no-underline block group cursor-pointer">
      <div
        onMouseMove={handleMouse}
        className="relative bg-surface rounded-2xl border border-border h-full overflow-hidden transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/5"
      >
        <CardPattern mouseX={mx} mouseY={my} str={str} />
        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between mb-4">
            <span className={cn("text-3xl transition-colors duration-200", iconColor)}>{icon}</span>
            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0", badge)}>{cat}</span>
          </div>
          <div className="relative">
            <div className={cn(
              "absolute left-0 inset-y-0 h-6 group-hover:h-8 w-1 rounded-tr-full rounded-br-full transition-all duration-200",
              accent
            )} />
            <h3 className="font-heading text-base font-semibold text-text mb-1.5 group-hover:translate-x-2 transition-transform duration-200">
              {title}
            </h3>
          </div>
          <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
        </div>
      </div>
    </Link>
  );
}
