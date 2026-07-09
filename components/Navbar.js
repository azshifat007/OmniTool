'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 pt-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? 'bg-white/85 dark:bg-surface/85 nav-blur shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]'
              : 'bg-white dark:bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
          }`}
        >
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
              O
            </span>
            <span className="font-heading text-lg font-semibold text-text">
              OmniTool
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg border border-border text-text-secondary hover:text-text hover:border-text-tertiary transition-all cursor-pointer"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg border border-border text-sm font-medium text-text-secondary hover:text-text hover:border-text-tertiary transition-all no-underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">History</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
