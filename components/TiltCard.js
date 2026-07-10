'use client';

import Link from 'next/link';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randStr(len) {
  let r = '';
  for (let i = 0; i < len; i++) r += chars[Math.random() * chars.length | 0];
  return r;
}

function CardPattern({ mouseX, mouseY, str }) {
  const mask = useMotionTemplate`radial-gradient(320px at ${mouseX}px ${mouseY}px, white, transparent)`;
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover:opacity-40 transition-opacity duration-500" />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 backdrop-blur-xl transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ mask, WebkitMaskImage: mask }}
      >
        <p className="absolute inset-x-0 top-0 text-xs leading-none break-words whitespace-pre-wrap text-white/30 font-mono font-bold py-2 px-3 select-none">
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

  return (
    <Link href={href} className="no-underline block group h-full cursor-pointer">
      <div
        onMouseMove={handleMouse}
        className="relative bg-surface rounded-3xl border border-border h-full overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/15 group-hover:border-primary/40 group-hover:-translate-y-1"
      >
        <CardPattern mouseX={mx} mouseY={my} str={str} />
        <div className="relative z-10 flex flex-col items-center gap-3 w-full">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
            <div className="absolute inset-0 bg-white/90 dark:bg-black/90 blur-xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            <span className="relative z-10 text-3xl sm:text-4xl leading-none">{icon}</span>
          </div>
          <h3 className="font-heading text-base sm:text-lg font-semibold text-text mt-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            {cat}
          </span>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 max-w-[90%]">
            {children}
          </p>
        </div>
      </div>
    </Link>
  );
}
