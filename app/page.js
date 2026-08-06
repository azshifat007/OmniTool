'use client';

import { useState, useMemo } from 'react';
import TiltCard from '@/components/TiltCard';
import { Hero, TextStagger, AnimatedContainer } from '@/components/hero';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import tools from '@/lib/tools';

const CATS = ['All', ...new Set(tools.map(t => t.cat))];

const CAT_DOT_COLORS = {
  Text: 'bg-[#D94F2B]', PDF: 'bg-[#C8452B]', Code: 'bg-[#0F766E]', Security: 'bg-[#A21CAF]',
  Design: 'bg-[#6D28D9]', Math: 'bg-[#0E7490]', Date: 'bg-[#2563EB]', Network: 'bg-[#4338CA]',
  DevOps: 'bg-[#7C3AED]', Media: 'bg-[#E07A16]', Fun: 'bg-[#DB2777]', System: 'bg-[#1F5C4D]',
};

const QUICK_CONVERTS = [
  { from: 'MD', to: 'PDF', href: '/tools/md-to-pdf', title: 'Markdown to PDF' },
  { from: 'PDF', to: 'TXT', href: '/tools/pdf-to-txt', title: 'PDF to TXT' },
  { from: 'PDF', to: 'MD', href: '/tools/pdf-to-md', title: 'PDF to Markdown' },
  { from: 'TXT', to: 'PDF', href: '/tools/text-to-pdf', title: 'Text to PDF' },
  { from: 'CSV', to: 'JSON', href: '/tools/csv-to-json', title: 'CSV to JSON' },
  { from: 'JSON', to: 'YAML', href: '/tools/yaml', title: 'JSON to YAML' },
  { from: 'HTML', to: 'MD', href: '/tools/html2md', title: 'HTML to Markdown' },
  { from: 'XML', to: 'JSON', href: '/tools/xml-to-json', title: 'XML to JSON' },
];

const STATS = [
  { value: () => `${tools.length}+`, label: 'tools' },
  { value: () => `${CATS.length - 1}`, label: 'categories' },
  { value: () => '100%', label: 'free & open' },
  { value: () => '0', label: 'servers involved' },
];

export default function Home() {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = activeCat === 'All' ? tools : tools.filter(t => t.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
    }
    return items;
  }, [activeCat, search]);

  const counts = useMemo(() => {
    const c = { All: tools.length };
    tools.forEach(t => { c[t.cat] = (c[t.cat] || 0) + 1; });
    return c;
  }, []);

  const tickerTools = useMemo(() => [...tools.slice(0, 16), ...tools.slice(0, 16)], []);

  return (
    <div>
      <Hero className="mb-10 !min-h-0 !pb-0 bg-transparent relative">
        <div className="relative">
          <span aria-hidden className="watermark absolute -top-10 -right-6 sm:-right-16 text-[11rem] sm:text-[17rem] font-heading font-extrabold leading-none tracking-tighter select-none pointer-events-none">
            O
          </span>
        </div>

        <AnimatedContainer transformDirection="bottom">
          <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            {tools.length} powerful tools
          </div>
        </AnimatedContainer>

        <TextStagger
          text="Everything you need,"
          stagger={0.035}
          direction="bottom"
          className="relative font-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-text mb-2 tracking-tight leading-[1.05]"
        />
        <TextStagger
          text="nothing you don't."
          stagger={0.035}
          direction="bottom"
          className="relative font-heading text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.05]"
        />

        <AnimatedContainer transformDirection="bottom" transition={{ delay: 0.55, duration: 0.5 }}>
          <p className="relative text-text-secondary text-sm sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            A playful toolkit for developers, creators, and tinkerers. Every tool runs
            <span className="text-primary font-semibold"> directly in your browser</span> — nothing leaves your machine.
          </p>
        </AnimatedContainer>

        {/* Quick convert widget — CloudConvert-style tool-first hero */}
        <AnimatedContainer transformDirection="bottom" transition={{ delay: 0.75, duration: 0.5 }}>
          <div className="relative max-w-2xl mx-auto w-full bg-surface/80 nav-blur rounded-2xl border border-border shadow-[var(--color-shadow-nav)] p-5 sm:p-6 text-left">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="eyebrow !text-[0.65rem]">Quick convert</span>
              <span className="text-[11px] font-mono text-text-tertiary hidden sm:inline">picked from {tools.length} tools</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUICK_CONVERTS.map((c, i) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-bg p-3 hover:border-primary/40 hover:bg-primary/[0.04] transition-all no-underline"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-mono font-bold">{c.from}</span>
                    <svg className="w-3 h-3 text-text-tertiary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-[11px] font-mono font-bold">{c.to}</span>
                  </div>
                  <span className="text-center text-[11px] text-text-secondary leading-tight group-hover:text-text transition-colors">
                    {c.title}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-text-tertiary">
              <span className="font-mono">PDF · DOCX · PNG · MP3</span>
              <span className="w-1 h-1 rounded-full bg-text-tertiary/50" />
              <span>and every format in between</span>
            </div>
          </div>
        </AnimatedContainer>

        {/* Stats — trust bar */}
        <AnimatedContainer transformDirection="bottom" transition={{ delay: 0.95, duration: 0.5 }}>
          <div className="relative flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-10">
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="font-heading text-2xl sm:text-3xl font-bold text-text">{s.value()}</span>
                <span className="text-xs text-text-secondary uppercase tracking-wider">{s.label}</span>
                {i < STATS.length - 1 && <span className="hidden sm:block w-1 h-1 rounded-full bg-text-tertiary/40 ml-6" />}
              </div>
            ))}
          </div>
        </AnimatedContainer>
      </Hero>

      {/* Format ticker */}
      <div className="marquee-paused relative overflow-hidden border-y border-border bg-surface/60 backdrop-blur-sm py-3 mb-12 -mx-5">
        <div className="flex w-max animate-marquee" style={{ '--marquee-duration': '45s' }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {tickerTools.map((t) => (
                <Link key={`${dup}-${t.href}`} href={t.href}
                  className="flex items-center gap-2 px-5 py-1 text-sm text-text-secondary hover:text-primary transition-colors no-underline whitespace-nowrap">
                  <span className="text-base w-5 text-center">{t.icon}</span>
                  <span className="font-medium">{t.title}</span>
                  <span className="text-[10px] font-mono uppercase text-text-tertiary">{t.cat}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-8 space-y-4"
      >
        <div className="flex gap-2 justify-center flex-wrap">
          {CATS.map(cat => {
            const isActive = activeCat === cat;
            const dotColor = cat === 'All' ? 'bg-primary' : (CAT_DOT_COLORS[cat] || 'bg-primary');
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-solid text-white border-primary-solid shadow-lg shadow-primary/20'
                    : 'bg-surface text-text-secondary border-border hover:text-text hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : dotColor}`} />
                {cat}
                <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-text-tertiary'}`}>
                  {counts[cat]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative max-w-xs mx-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter tools..."
            className="w-full bg-surface rounded-xl pl-9 pr-3 py-2.5 text-sm text-text border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-text-tertiary shadow-sm"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCat + search}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(tool => (
            <motion.div
              key={tool.href}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TiltCard href={tool.href} cat={tool.cat} icon={tool.icon} title={tool.title}>
                {tool.desc}
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <p className="text-text-tertiary text-sm">No tools match your search.</p>
        </motion.div>
      )}
    </div>
  );
}
