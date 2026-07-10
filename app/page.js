'use client';

import { useState, useMemo } from 'react';
import TiltCard from '@/components/TiltCard';
import { motion, AnimatePresence } from 'framer-motion';
import tools from '@/lib/tools';

const CATS = ['All', ...new Set(tools.map(t => t.cat))];

const catStyles = {
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

const iconColors = {
  Text: 'text-cat-text', PDF: 'text-cat-pdf', Document: 'text-cat-document',
  Code: 'text-cat-code', Security: 'text-cat-security', Design: 'text-cat-design',
  Date: 'text-cat-date', Media: 'text-cat-media', Math: 'text-cat-math',
  Network: 'text-cat-network', DevOps: 'text-cat-devops', Fun: 'text-cat-fun',
  System: 'text-cat-system',
};

const catColorMap = {
  Text: 'cat-text/', PDF: 'cat-pdf/', Document: 'cat-document/',
  Code: 'cat-code/', Security: 'cat-security/', Design: 'cat-design/',
  Date: 'cat-date/', Media: 'cat-media/', Math: 'cat-math/',
  Network: 'cat-network/', DevOps: 'cat-devops/', Fun: 'cat-fun/',
  System: 'cat-system/',
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
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1] }}
        className="mb-12 text-center relative"
      >
        <div className="absolute inset-0 flex justify-center -top-20 pointer-events-none overflow-hidden">
          <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 via-accent/5 to-cat-text/5 blur-3xl" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5 relative">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          {tools.length} powerful tools
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-4 tracking-tight leading-[1.1] relative">
          Everything you need,
          <br />
          <span className="gradient-text">
            nothing you don't
          </span>
        </h1>
        <p className="text-text-secondary text-base sm:text-lg max-w-lg mx-auto leading-relaxed relative">
          A playful toolkit for developers, creators, and tinkerers — all in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-wrap gap-2 justify-center">
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map(tool => (
            <motion.div
              key={tool.href}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TiltCard href={tool.href}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-3xl ${iconColors[tool.cat] || 'text-text-tertiary'}`}>
                    {tool.icon}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${catStyles[tool.cat] || 'bg-badge-bg text-text-tertiary border-border'}`}>
                    {tool.cat}
                  </span>
                </div>
                <h3 className="font-heading text-base font-semibold text-text mb-1.5">{tool.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{tool.desc}</p>
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
