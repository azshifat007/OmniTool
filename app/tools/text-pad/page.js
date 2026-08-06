'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TextPadPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('pad me');
  const [char, setChar] = useState('-');
  const [width, setWidth] = useState(20);
  const [align, setAlign] = useState('left');

  const padLeft = useCallback(() => {
    addEntry('Text Padding');
    return input.split('\n').map(line => line.padStart(width, char)).join('\n');
  }, [input, char, width, addEntry]);

  const padRight = useCallback(() => {
    addEntry('Text Padding');
    return input.split('\n').map(line => line.padEnd(width, char)).join('\n');
  }, [input, char, width, addEntry]);

  const padBoth = useCallback(() => {
    addEntry('Text Padding');
    return input.split('\n').map(line => {
      const padLen = Math.max(0, width - line.length);
      const left = Math.floor(padLen / 2);
      const right = padLen - left;
      return char.repeat(left) + line + char.repeat(right);
    }).join('\n');
  }, [input, char, width, addEntry]);

  const getResult = () => {
    if (align === 'left') return padRight();
    if (align === 'right') return padLeft();
    return padBoth();
  };

  const result = getResult();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">≡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Padding</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Text</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Char</label>
                <input value={char} onChange={(e) => setChar(e.target.value.slice(0, 1) || ' ')} maxLength={1}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Width</label>
                <input type="number" min={1} value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Align</label>
                <select value={align} onChange={(e) => setAlign(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  <option value="left">Left</option><option value="right">Right</option><option value="center">Center</option>
                </select>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Result</span>
              <CopyButton text={result} className="text-xs" />
            </div>
            <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[120px] whitespace-pre-wrap overflow-x-auto">{result}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
