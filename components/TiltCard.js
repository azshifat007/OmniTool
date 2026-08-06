'use client';

import Link from 'next/link';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const CAT_COLORS = {
  Text: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', hoverBg: 'group-hover:bg-red-500' },
  PDF: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', hoverBg: 'group-hover:bg-rose-500' },
  Code: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', hoverBg: 'group-hover:bg-cyan-500' },
  Security: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20', hoverBg: 'group-hover:bg-pink-500' },
  Design: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', hoverBg: 'group-hover:bg-violet-500' },
  Math: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20', hoverBg: 'group-hover:bg-teal-500' },
  Date: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', hoverBg: 'group-hover:bg-blue-500' },
  Network: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20', hoverBg: 'group-hover:bg-indigo-500' },
  DevOps: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', hoverBg: 'group-hover:bg-purple-500' },
  Media: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', hoverBg: 'group-hover:bg-orange-500' },
  Fun: { bg: 'bg-pink-400/10', text: 'text-pink-400', border: 'border-pink-400/20', hoverBg: 'group-hover:bg-pink-400' },
  System: { bg: 'bg-violet-400/10', text: 'text-violet-400', border: 'border-violet-400/20', hoverBg: 'group-hover:bg-violet-400' },
};

const DEFAULT_CAT = { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', hoverBg: 'group-hover:bg-primary' };

function randStr(len) {
  let r = '';
  for (let i = 0; i < len; i++) r += chars[Math.random() * chars.length | 0];
  return r;
}

function CardPattern({ mouseX, mouseY, str }) {
  const mask = useMotionTemplate`radial-gradient(320px at ${mouseX}px ${mouseY}px, white, transparent)`;
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover:opacity-30 transition-opacity duration-500" />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 backdrop-blur-xl transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      >
        <p className="absolute inset-x-0 top-0 text-[10px] leading-none break-words whitespace-pre-wrap text-white/20 font-mono font-bold py-2 px-3 select-none">
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

  const catColors = useMemo(() => CAT_COLORS[cat] || DEFAULT_CAT, [cat]);

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
        className="relative bg-surface rounded-2xl border border-border h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:border-primary/30 group-hover:-translate-y-1"
      >
        <CardPattern mouseX={mx} mouseY={my} str={str} />
        <div className="relative z-10 flex flex-col items-center gap-2.5 w-full">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-bg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10">
            <span className="relative z-10 text-2xl sm:text-3xl leading-none">{icon}</span>
          </div>
          <h3 className="font-heading text-sm sm:text-base font-semibold text-text group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColors.bg} ${catColors.text} ${catColors.border} ${catColors.hoverBg} group-hover:text-white transition-all duration-300`}>
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
