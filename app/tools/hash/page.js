'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const algos = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleHash = useCallback(async () => {
    if (!input.trim()) { setOutput(''); return; }
    setError('');
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
      addEntry('Hash Generator');
    } catch (e) {
      setError(e.message);
    }
  }, [input, algorithm, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">Hash Generator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap gap-2">
            {algos.map((a) => (
              <button key={a} onClick={() => setAlgorithm(a)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  algorithm === a ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}
              >{a}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Input Text</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter text to hash..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">{algorithm} Hash</span>
              <div className="flex items-center gap-2">
                <button onClick={handleHash} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <div className="bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text break-all border border-border/50 min-h-[100px]">
              {output || <span className="text-text-secondary">Hash output...</span>}
            </div>
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
