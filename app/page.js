'use client';

import { useState, useMemo } from 'react';
import TiltCard from '@/components/TiltCard';
import { Hero, TextStagger, AnimatedContainer } from '@/components/hero';
import { motion, AnimatePresence } from 'framer-motion';
import tools from '@/lib/tools';

const CATS = ['All', ...new Set(tools.map(t => t.cat))];

const CAT_DOT_COLORS = {
  Text: 'bg-red-500', PDF: 'bg-rose-500', Code: 'bg-cyan-500', Security: 'bg-pink-500',
  Design: 'bg-violet-500', Math: 'bg-teal-500', Date: 'bg-blue-500', Network: 'bg-indigo-500',
  DevOps: 'bg-purple-500', Media: 'bg-orange-500', Fun: 'bg-pink-400', System: 'bg-violet-400',
};

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

  return (
    <div>
      <Hero className="mb-10 !min-h-0 !pb-0 bg-transparent relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.07)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
        <AnimatedContainer transformDirection="bottom">
          <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            {tools.length} powerful tools
          </div>
        </AnimatedContainer>
        <TextStagger
          text="Everything you need, nothing you don't"
          stagger={0.04}
          direction="bottom"
          className="relative font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-text mb-4 tracking-tight leading-[1.1]"
        />
        <AnimatedContainer transformDirection="bottom" transition={{ delay: 0.6, duration: 0.5 }}>
          <p className="relative text-text-secondary text-sm sm:text-lg max-w-lg mx-auto leading-relaxed">
            A playful toolkit for developers, creators, and tinkerers — all in one place.
          </p>
        </AnimatedContainer>
      </Hero>

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
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
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
