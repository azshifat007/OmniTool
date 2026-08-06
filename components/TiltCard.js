'use client';

import Link from 'next/link';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const CAT_COLORS = {
  Text: { icon: 'bg-cat-text/10 text-cat-text', badge: 'border-cat-text/25 bg-cat-text/10 text-cat-text', hoverBorder: 'group-hover:border-cat-text/40', bar: 'from-cat-text via-cat-text/60', arrow: 'text-cat-text', ring: 'border-cat-text/30 bg-cat-text/10' },
  PDF: { icon: 'bg-cat-pdf/10 text-cat-pdf', badge: 'border-cat-pdf/25 bg-cat-pdf/10 text-cat-pdf', hoverBorder: 'group-hover:border-cat-pdf/40', bar: 'from-cat-pdf via-cat-pdf/60', arrow: 'text-cat-pdf', ring: 'border-cat-pdf/30 bg-cat-pdf/10' },
  Code: { icon: 'bg-cat-code/10 text-cat-code', badge: 'border-cat-code/25 bg-cat-code/10 text-cat-code', hoverBorder: 'group-hover:border-cat-code/40', bar: 'from-cat-code via-cat-code/60', arrow: 'text-cat-code', ring: 'border-cat-code/30 bg-cat-code/10' },
  Security: { icon: 'bg-cat-security/10 text-cat-security', badge: 'border-cat-security/25 bg-cat-security/10 text-cat-security', hoverBorder: 'group-hover:border-cat-security/40', bar: 'from-cat-security via-cat-security/60', arrow: 'text-cat-security', ring: 'border-cat-security/30 bg-cat-security/10' },
  Design: { icon: 'bg-cat-design/10 text-cat-design', badge: 'border-cat-design/25 bg-cat-design/10 text-cat-design', hoverBorder: 'group-hover:border-cat-design/40', bar: 'from-cat-design via-cat-design/60', arrow: 'text-cat-design', ring: 'border-cat-design/30 bg-cat-design/10' },
  Math: { icon: 'bg-cat-math/10 text-cat-math', badge: 'border-cat-math/25 bg-cat-math/10 text-cat-math', hoverBorder: 'group-hover:border-cat-math/40', bar: 'from-cat-math via-cat-math/60', arrow: 'text-cat-math', ring: 'border-cat-math/30 bg-cat-math/10' },
  Date: { icon: 'bg-cat-date/10 text-cat-date', badge: 'border-cat-date/25 bg-cat-date/10 text-cat-date', hoverBorder: 'group-hover:border-cat-date/40', bar: 'from-cat-date via-cat-date/60', arrow: 'text-cat-date', ring: 'border-cat-date/30 bg-cat-date/10' },
  Network: { icon: 'bg-cat-network/10 text-cat-network', badge: 'border-cat-network/25 bg-cat-network/10 text-cat-network', hoverBorder: 'group-hover:border-cat-network/40', bar: 'from-cat-network via-cat-network/60', arrow: 'text-cat-network', ring: 'border-cat-network/30 bg-cat-network/10' },
  DevOps: { icon: 'bg-cat-devops/10 text-cat-devops', badge: 'border-cat-devops/25 bg-cat-devops/10 text-cat-devops', hoverBorder: 'group-hover:border-cat-devops/40', bar: 'from-cat-devops via-cat-devops/60', arrow: 'text-cat-devops', ring: 'border-cat-devops/30 bg-cat-devops/10' },
  Media: { icon: 'bg-cat-media/10 text-cat-media', badge: 'border-cat-media/25 bg-cat-media/10 text-cat-media', hoverBorder: 'group-hover:border-cat-media/40', bar: 'from-cat-media via-cat-media/60', arrow: 'text-cat-media', ring: 'border-cat-media/30 bg-cat-media/10' },
  Fun: { icon: 'bg-cat-fun/10 text-cat-fun', badge: 'border-cat-fun/25 bg-cat-fun/10 text-cat-fun', hoverBorder: 'group-hover:border-cat-fun/40', bar: 'from-cat-fun via-cat-fun/60', arrow: 'text-cat-fun', ring: 'border-cat-fun/30 bg-cat-fun/10' },
  System: { icon: 'bg-cat-system/10 text-cat-system', badge: 'border-cat-system/25 bg-cat-system/10 text-cat-system', hoverBorder: 'group-hover:border-cat-system/40', bar: 'from-cat-system via-cat-system/60', arrow: 'text-cat-system', ring: 'border-cat-system/30 bg-cat-system/10' },
};

const DEFAULT_CAT = {
  icon: 'bg-primary/10 text-primary', badge: 'border-primary/25 bg-primary/10 text-primary',
  hoverBorder: 'group-hover:border-primary/40', bar: 'from-primary via-primary/60',
  arrow: 'text-primary', ring: 'border-primary/30 bg-primary/10',
};

function randStr(len) {
  let r = '';
  for (let i = 0; i < len; i++) r += chars[Math.random() * chars.length | 0];
  return r;
}

function CardPattern({ mouseX, mouseY, str }) {
  const mask = useMotionTemplate`radial-gradient(320px at ${mouseX}px ${mouseY}px, white, transparent)`;
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 opacity-0 group-hover:opacity-100 backdrop-blur-xl transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      >
        <p className="absolute inset-x-0 top-0 text-[10px] leading-none break-words whitespace-pre-wrap text-primary/25 font-mono font-bold py-2 px-3 select-none">
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

  const c = useMemo(() => CAT_COLORS[cat] || DEFAULT_CAT, [cat]);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    setStr(randStr(600));
  }, [mx, my]);

  return (
    <Link href={href} className="no-underline block group h-full cursor-pointer">
      <div
        onMouseMove={handleMouse}
        className={`relative bg-surface rounded-2xl border border-border h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 ${c.hoverBorder} group-hover:-translate-y-1`}
      >
        <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.bar} to-transparent`} />
        <span className={`absolute top-3 right-3 w-6 h-6 rounded-full border opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${c.ring} flex items-center justify-center`}>
          <svg className={`w-3 h-3 ${c.arrow}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
          </svg>
        </span>
        <CardPattern mouseX={mx} mouseY={my} str={str} />
        <div className="relative z-10 flex flex-col items-center gap-2.5 w-full">
          <div className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ${c.icon} flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10`}>
            <span className="relative z-10 text-2xl sm:text-3xl leading-none">{icon}</span>
          </div>
          <h3 className="font-heading text-sm sm:text-base font-semibold text-text group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.badge} transition-all duration-300`}>
            {cat}
          </span>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 max-w-[90%]">
            {children}
          </p>
        </div>
      </div>
    </Link>
  );
}
