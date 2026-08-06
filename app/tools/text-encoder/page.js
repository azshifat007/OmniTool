'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';

const MODES = [
  { id: 'encode', label: 'Encode' },
  { id: 'decode', label: 'Decode' },
];

const TYPES = [
  { id: 'binary', label: 'Binary', base: 2, pad: 8, sep: ' ' },
  { id: 'hex', label: 'Hex', base: 16, pad: 2, sep: ' ' },
  { id: 'octal', label: 'Octal', base: 8, pad: 3, sep: ' ' },
  { id: 'decimal', label: 'Decimal', base: 10, pad: 0, sep: ' ' },
];

function process(text, mode, type) {
  if (!text.trim()) return '';
  try {
    if (mode === 'encode') {
      return [...text].map(c => c.charCodeAt(0).toString(type.base).padStart(type.pad, '0')).join(type.sep);
    } else {
      const tokens = text.trim().split(/\s+/);
      return String.fromCharCode(...tokens.map(t => parseInt(t, type.base)));
    }
  } catch {
    return 'Error: invalid input';
  }
}

export default function TextEncoderPage() {
  const [input, setInput] = useState('Hello World');
  const [mode, setMode] = useState('encode');
  const [type, setType] = useState('binary');

  const output = useMemo(() => process(input, mode, TYPES.find(t => t.id === type) || TYPES[0]), [input, mode, type]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">01</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Encoder</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  mode === m.id ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
                }`}>{m.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  type === t.id ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
                }`}>{t.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">{mode === 'encode' ? 'Text' : 'Encoded'} Input</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={6}
                className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono resize-none outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-tertiary">{mode === 'encode' ? 'Encoded' : 'Decoded'} Output</label>
                {input && <CopyButton text={output} />}
              </div>
              <div className="w-full h-[152px] bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {output || <span className="text-text-tertiary">Output will appear here</span>}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
