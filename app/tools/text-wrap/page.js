'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TextWrapPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('This is a long line of text that needs to be wrapped to a specific width for better readability in different contexts.');
  const [width, setWidth] = useState(40);
  const [mode, setMode] = useState('word');

  const wrap = useCallback(() => {
    addEntry('Text Wrapper');
    const lines = input.split('\n');
    const result = lines.map(line => {
      if (mode === 'char') {
        const out = [];
        for (let i = 0; i < line.length; i += width) out.push(line.slice(i, i + width));
        return out.join('\n');
      }
      const words = line.split(' ');
      const out = [];
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length <= width) {
          current = (current + ' ' + word).trim();
        } else {
          if (current) out.push(current);
          current = word.length > width ? word.match(new RegExp('.{1,' + width + '}', 'g')).join('\n') : word;
        }
      }
      if (current) out.push(current);
      return out.join('\n');
    }).join('\n');
    return result;
  }, [input, width, mode, addEntry]);

  const result = wrap();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">≡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text Wrapper</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Text</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Width: {width}</label>
                <input type="range" min={10} max={120} value={width} onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Mode</label>
                <div className="flex gap-2">
                  <button onClick={() => setMode('word')}
                    className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all cursor-pointer ${mode === 'word' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Word</button>
                  <button onClick={() => setMode('char')}
                    className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all cursor-pointer ${mode === 'char' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Char</button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Wrapped ({width} cols)</span>
              <CopyButton text={result} className="text-xs" />
            </div>
            <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[200px] whitespace-pre-wrap overflow-x-auto">{result}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
