'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function invertCase(s) {
  return s.replace(/[a-zA-Z]/g, (c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase());
}

export default function ReverserPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');

  const reversed = input.split('').reverse().join('');
  const reverseWords = input.split(/\s+/).reverse().join(' ');
  const uppercase = input.toUpperCase();
  const lowercase = input.toLowerCase();
  const invertCased = invertCase(input);

  const transforms = [
    { id: 'reversed', label: 'Reversed', value: reversed },
    { id: 'reverseWords', label: 'Reverse Words', value: reverseWords },
    { id: 'uppercase', label: 'UPPERCASE', value: uppercase },
    { id: 'lowercase', label: 'lowercase', value: lowercase },
    { id: 'invertCase', label: 'Invert Case', value: invertCased },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">↔️</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Reverser</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-1.5 block">Input text</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) addEntry('Text Reverser'); }}
            placeholder="Type or paste text here..."
            className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary"
          />
          <div className="text-xs text-text-tertiary mt-2">{input.length} characters</div>
        </div>
      </GlassCard>

      {input.trim() && (
        <div className="space-y-3 mt-5">
          {transforms.map((t) => (
            <GlassCard key={t.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">{t.label}</span>
                  <CopyButton text={t.value} />
                </div>
                <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                  {t.value || <span className="text-text-tertiary">—</span>}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
