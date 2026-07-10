'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function caesarShift(text, shift) {
  return text.split('').map(ch => {
    if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26 + 26) % 26 + 65);
    if (ch >= 'a' && ch <= 'z') return String.fromCharCode(((ch.charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97);
    return ch;
  }).join('');
}

export default function CaesarCipherPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog.');
  const [shift, setShift] = useState(3);
  const [direction, setDirection] = useState('encode');

  const result = caesarShift(input, direction === 'encode' ? shift : -shift);

  const handleCopyResult = useCallback(() => {
    addEntry('Caesar Cipher');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚔</span>
        <h1 className="font-heading text-2xl font-bold text-text">Caesar Cipher</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Text</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Shift</label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={25} value={shift} onChange={(e) => setShift(Number(e.target.value))}
                  className="flex-1 accent-primary cursor-pointer" />
                <span className="text-sm font-mono text-text w-8 text-center">{shift}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Direction</label>
              <div className="flex gap-2">
                <button onClick={() => setDirection('encode')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${direction === 'encode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Encode</button>
                <button onClick={() => setDirection('decode')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${direction === 'decode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Decode</button>
                <button onClick={() => setDirection('rot13')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${direction === 'rot13' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>ROT13</button>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">{direction === 'encode' ? 'Encoded' : direction === 'decode' ? 'Decoded' : 'ROT13'} Output</span>
              <CopyButton text={result} className="text-xs" />
            </div>
            <div className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[100px] break-all" onClick={handleCopyResult}>{result}</div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
