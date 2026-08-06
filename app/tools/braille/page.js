'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const BRAILLE = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵',
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊',
};

export default function BraillePage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('Hello World');
  const [reverse, setReverse] = useState(false);

  const braille = useMemo(() => {
    if (reverse) {
      const map = Object.fromEntries(Object.entries(BRAILLE).map(([k, v]) => [v, k]));
      return text.split('').map((ch) => map[ch] ?? ch).join('');
    }
    return text
      .toLowerCase()
      .split('')
      .map((ch) => (ch === ' ' ? ' ' : BRAILLE[ch] ?? ch))
      .join('');
  }, [text, reverse]);

  const onChange = (e) => { setText(e.target.value); addEntry('Braille Translator'); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⠿</span>
        <h1 className="font-heading text-2xl font-bold text-text">Braille Translator</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Translate text to and from Grade-1 Braille Unicode.</p>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer w-fit mx-auto">
            <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
            Reverse (Braille → text)
          </label>

          <div>
            <label className="text-xs text-text-tertiary block mb-2">{reverse ? 'Braille Input' : 'Text Input'}</label>
            <textarea value={text} onChange={onChange} rows={3}
              className="w-full bg-surface rounded-xl px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none resize-none leading-relaxed" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">{reverse ? 'Text Output' : 'Braille Output'}</span>
              <CopyButton text={braille} />
            </div>
            <div className="bg-surface rounded-xl p-4 text-2xl leading-relaxed break-words border border-border/50 min-h-[3rem]">
              {braille || '—'}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
