'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function crc32(text) {
  if (!text) return '';
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  const enc = new TextEncoder().encode(text);
  for (const byte of enc) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
}

export default function Crc32Page() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Hello, World!');
  const hash = crc32(input);

  const handleInput = useCallback((e) => {
    setInput(e.target.value);
    addEntry('CRC32 Checksum');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">CRC32 Checksum</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Calculate the CRC32 checksum of any text input. Useful for data integrity checks.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Input</label>
            <textarea value={input} onChange={handleInput} rows={4}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
          </div>
          <div className="bg-surface rounded-xl p-4 border border-border/50">
            <div className="text-xs text-text-tertiary mb-1">CRC32</div>
            <div className="text-xl font-mono font-bold text-text tracking-wider">{hash || '—'}</div>
          </div>
          <div className="flex justify-center"><CopyButton text={hash} className="text-xs" /></div>
          <div className="text-xs text-text-tertiary text-center">Auto-updates as you type</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
