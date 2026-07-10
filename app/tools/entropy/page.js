'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function calcEntropy(text) {
  if (!text) return { bits: 0, strength: 'None', log10: 0, charSet: 0, charsetSize: 0 };
  const len = text.length;
  let sets = 0;
  if (/[a-z]/.test(text)) sets += 26;
  if (/[A-Z]/.test(text)) sets += 26;
  if (/\d/.test(text)) sets += 10;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~ ]/.test(text)) sets += 33;
  const bits = len * Math.log2(sets || 1);
  const log10 = len * Math.log10(sets || 1);
  let strength = 'Very Weak';
  if (bits >= 128) strength = 'Very Strong';
  else if (bits >= 80) strength = 'Strong';
  else if (bits >= 60) strength = 'Moderate';
  else if (bits >= 36) strength = 'Weak';
  const freq = {};
  for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
  const shannon = -Object.values(freq).reduce((sum, c) => { const p = c / len; return sum + p * Math.log2(p); }, 0);
  return { bits: Math.round(bits * 100) / 100, strength, log10: Math.round(log10 * 100) / 100, charSet: sets || 0, charsetSize: sets, shannon: Math.round(shannon * 100) / 100, len };
}

export default function EntropyPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');

  const entropy = calcEntropy(input);

  const handleInput = useCallback((e) => {
    setInput(e.target.value);
    addEntry('Entropy Calculator');
  }, [addEntry]);

  const strengthColors = {
    'Very Weak': 'text-cat-text',
    'Weak': 'text-cat-warning',
    'Moderate': 'text-cat-success',
    'Strong': 'text-cat-primary',
    'Very Strong': 'text-cat-primary',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">Entropy Calculator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Text / Password</label>
            <textarea value={input} onChange={handleInput} rows={4} placeholder="Type or paste text to calculate entropy..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            {input && (
              <div className="mt-3 flex">
                <CopyButton text={input} className="text-xs" />
                <span className="text-[10px] text-text-tertiary self-center ml-2">Copy input</span>
              </div>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-2">
            <span className="text-xs text-text-tertiary mb-3 block">Analysis</span>
            {!input ? (
              <div className="text-text-tertiary text-sm">Enter text to analyze its entropy.</div>
            ) : (
              <>
                <div className="flex justify-between py-2 px-3 rounded-lg bg-surface border border-border/50 items-center">
                  <span className="text-text-tertiary text-sm">Strength</span>
                  <span className={`text-sm font-bold ${strengthColors[entropy.strength] || 'text-text'}`}>{entropy.strength}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">Entropy</span><span className="font-mono text-text">{entropy.bits} bits</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">Character Set</span><span className="font-mono text-text">{entropy.charSet} chars ({entropy.charsetSize} classes)</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">Length</span><span className="font-mono text-text">{entropy.len} chars</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">Shannon Entropy</span><span className="font-mono text-text">{entropy.shannon} bits/char</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">log₁₀ (cracking)</span><span className="font-mono text-text">{entropy.log10}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                    <motion.div initial={{ width: 0 }} animate={{ width: Math.min(entropy.bits / 1.28, 100) + '%' }}
                      className="h-full rounded-full bg-gradient-to-r from-cat-text via-cat-warning via-cat-success to-cat-primary transition-all" />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                    <span>0</span><span>36</span><span>60</span><span>80</span><span>128</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
