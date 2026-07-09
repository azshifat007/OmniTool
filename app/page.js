'use client';

import TiltCard from '@/components/TiltCard';
import { motion } from 'framer-motion';
import tools from '@/lib/tools';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1] } },
};

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
  Text: 'text-cat-text',
  PDF: 'text-cat-pdf',
  Document: 'text-cat-document',
  Code: 'text-cat-code',
  Security: 'text-cat-security',
  Design: 'text-cat-design',
  Date: 'text-cat-date',
  Media: 'text-cat-media',
  Math: 'text-cat-math',
  Network: 'text-cat-network',
  DevOps: 'text-cat-devops',
  Fun: 'text-cat-fun',
  System: 'text-cat-system',
};

export default function Home() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1] }}
        className="mb-14 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          {tools.length} powerful tools
        </div>
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-text mb-4 tracking-tight leading-[1.1]">
          Everything you need,
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-cat-text bg-clip-text text-transparent">
            nothing you don't
          </span>
        </h1>
        <p className="text-text-secondary text-lg sm:text-xl max-w-lg mx-auto leading-relaxed">
          A playful toolkit for developers, creators, and tinkerers — all in one place.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {tools.map((tool, i) => (
          <motion.div key={tool.href} variants={fadeUp}>
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-text-tertiary text-xs">
          All processing happens locally in your browser. Nothing leaves your machine.
        </p>
      </motion.div>
    </div>
  );
}
