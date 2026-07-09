'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';

const cases = [
  { id: 'upper', label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: (s) => s.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'camel', label: 'camelCase', fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { id: 'snake', label: 'snake_case', fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') },
  { id: 'kebab', label: 'kebab-case', fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') },
  { id: 'pascal', label: 'PascalCase', fn: (s) => (s.match(/[a-zA-Z0-9]+/g) || []).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('') },
  { id: 'dot', label: 'dot.case', fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '') },
];

export default function CasePage() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState('lower');

  const activeCase = cases.find((c) => c.id === active);
  const output = input ? activeCase.fn(input) : '';

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Case Converter</h1>
        <p className="text-text-secondary">Transform text between common casing formats</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-5">
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
              active === c.id
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-text'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface rounded-2xl border border-border p-4">
          <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text here..."
            className="w-full h-48 bg-transparent text-text resize-none outline-none text-sm leading-relaxed placeholder:text-text-tertiary"
          />
          <div className="text-xs text-text-tertiary mt-2">{input.length} characters</div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <div className="w-full h-48 overflow-auto text-text text-sm leading-relaxed break-words whitespace-pre-wrap">
            {output || <span className="text-text-tertiary">Converted text will appear here</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
