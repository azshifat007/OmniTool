'use client';

import { useState, useMemo } from 'react';
import TiltCard from '@/components/TiltCard';
import { Hero, BgGradient, TextStagger, AnimatedContainer } from '@/components/hero';
import { motion, AnimatePresence } from 'framer-motion';
import tools from '@/lib/tools';

const CATS = ['All', ...new Set(tools.map(t => t.cat))];

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
      <Hero className="mb-12 !min-h-0 !pb-0">
        <BgGradient
          gradientSize="lg"
          gradientPosition={{ x: "50%", y: "-20%" }}
          gradientColors={[
            { color: "rgb(108, 92, 231)", start: "0%" },
            { color: "rgb(255, 138, 101)", start: "40%" },
            { color: "rgb(15, 15, 20)", start: "80%" },
          ]}
          className="opacity-30"
          darkClassName="opacity-50"
        />
        <AnimatedContainer transformDirection="bottom">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            {tools.length} powerful tools
          </div>
        </AnimatedContainer>
        <TextStagger
          text="Everything you need, nothing you don't"
          stagger={0.04}
          direction="bottom"
          className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-text mb-4 tracking-tight leading-[1.1]"
        />
        <AnimatedContainer transformDirection="bottom" transition={{ delay: 0.6, duration: 0.5 }}>
          <p className="text-text-secondary text-sm sm:text-lg max-w-lg mx-auto leading-relaxed">
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
        <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activeCat === cat
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-text-secondary border-border hover:text-text hover:border-text-tertiary'
              }`}
            >
              {cat}
              <span className={`ml-1.5 text-[10px] ${activeCat === cat ? 'text-white/70' : 'text-text-tertiary'}`}>
                {counts[cat]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative max-w-xs mx-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter tools..."
            className="w-full bg-surface rounded-xl pl-9 pr-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary"
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
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5"
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-text-tertiary text-xs">
          All processing happens locally in your browser. Nothing leaves your machine.
        </p>
      </motion.div>
    </div>
  );
}
