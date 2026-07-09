'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import tools from '@/lib/tools';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = query.trim()
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.desc.toLowerCase().includes(query.toLowerCase()) ||
          t.cat.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20)
    : [];

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 pt-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`rounded-2xl px-5 py-3 flex items-center justify-between gap-3 transition-all duration-300 ${
            scrolled
              ? 'bg-white/85 dark:bg-surface/85 nav-blur shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]'
              : 'bg-white dark:bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
          }`}
        >
          <Link href="/" className="flex items-center gap-3 no-underline group shrink-0">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
              O
            </span>
            <span className="font-heading text-lg font-semibold text-text hidden sm:inline">
              OmniTool
            </span>
          </Link>

          <div ref={wrapperRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm pointer-events-none">
                ~
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search tools..."
                className="w-full bg-bg rounded-xl pl-8 pr-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary"
              />
            </div>

            <AnimatePresence>
              {focused && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                >
                  {results.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-text-tertiary">No tools found</div>
                  ) : (
                    results.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => { setFocused(false); setQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg transition-colors no-underline group"
                      >
                        <span className="text-lg shrink-0 w-6 text-center text-text-secondary group-hover:text-primary transition-colors">
                          {tool.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-text truncate">{tool.title}</div>
                          <div className="text-xs text-text-tertiary truncate">{tool.desc}</div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg border border-border text-text-tertiary shrink-0">
                          {tool.cat}
                        </span>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
