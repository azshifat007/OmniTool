'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';

const bases = [
  { id: 'bin', label: 'Binary', base: 2, prefix: '0b' },
  { id: 'oct', label: 'Octal', base: 8, prefix: '0o' },
  { id: 'dec', label: 'Decimal', base: 10, prefix: '' },
  { id: 'hex', label: 'Hexadecimal', base: 16, prefix: '0x' },
];

function convertAll(fromBase, fromValue) {
  const val = parseInt(fromValue, fromBase);
  if (isNaN(val) || val < 0) return null;
  if (val > Number.MAX_SAFE_INTEGER) return null;
  return {
    bin: val.toString(2),
    oct: val.toString(8),
    dec: val.toString(10),
    hex: val.toString(16).toUpperCase(),
  };
}

export default function BasePage() {
  const [active, setActive] = useState('dec');
  const [input, setInput] = useState('42');
  const base = bases.find((b) => b.id === active);
  const results = convertAll(base.base, input || '0');

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Base Converter</h1>
        <p className="text-text-secondary">Convert numbers between binary, octal, decimal, and hexadecimal</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-5">
        {bases.map((b) => (
          <button
            key={b.id}
            onClick={() => setActive(b.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              active === b.id
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-text'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">
          Enter {base.label} value
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={base.id === 'bin' ? 'e.g. 101010' : base.id === 'oct' ? 'e.g. 52' : base.id === 'hex' ? 'e.g. 2A' : 'e.g. 42'}
          className="w-full bg-transparent text-text text-lg font-mono outline-none placeholder:text-text-tertiary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bases.filter((b) => b.id !== active).map((b) => (
          <div key={b.id} className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">{b.label}</span>
              {results && <CopyButton text={b.prefix + results[b.id]} />}
            </div>
            <div className="text-lg font-mono text-text break-all">
              {results !== null ? b.prefix + results[b.id] : <span className="text-cat-text">Invalid</span>}
            </div>
          </div>
        ))}
      </div>

      {results === null && input && (
        <p className="text-cat-text text-sm mt-3">Enter a valid {base.label.toLowerCase()} number</p>
      )}
    </div>
  );
}
