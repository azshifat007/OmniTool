'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import tools from '@/lib/tools';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isToolPage = pathname !== '/';
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const { dark, toggle } = useTheme();

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
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
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
          className={`rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 transition-all duration-300 ${
            scrolled
              ? 'bg-surface/85 nav-blur shadow-[var(--color-shadow-nav)]'
              : 'bg-surface shadow-[var(--color-shadow-nav-sm)]'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            {isToolPage && (
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg border border-border text-text-secondary hover:text-text hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
                aria-label="Go back"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5 no-underline group">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:scale-105 transition-all">
                O
              </span>
              <span className="font-heading text-lg font-semibold text-text hidden sm:inline group-hover:text-primary transition-colors">
                OmniTool
              </span>
            </Link>
          </div>

          <div ref={wrapperRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search tools..."
                className="w-full bg-bg rounded-xl pl-9 pr-10 py-2 text-sm text-text border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-text-tertiary"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-bg border border-border text-text-tertiary pointer-events-none hidden sm:block">⌘K</kbd>
            </div>

            <AnimatePresence>
              {focused && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto z-50"
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
                          <div className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">{tool.title}</div>
                          <div className="text-xs text-text-tertiary truncate">{tool.desc}</div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          {tool.cat}
                        </span>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={toggle}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-bg border border-border text-text-secondary hover:text-text hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link
              href="/history"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-bg border border-border text-sm font-medium text-text-secondary hover:text-text hover:border-primary/50 hover:bg-primary/10 transition-all no-underline"
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
