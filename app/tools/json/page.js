'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function JsonPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('format');

  const handleProcess = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      const parsed = JSON.parse(input);
      let result;
      if (mode === 'format') result = JSON.stringify(parsed, null, 2);
      else if (mode === 'minify') result = JSON.stringify(parsed);
      else result = 'Valid JSON ✓';
      setOutput(result);
      addEntry('JSON Tools');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">{'{}'}</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON Tools</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex gap-2">
            {['format', 'minify', 'validate'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setOutput(''); setError(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Input JSON</span>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste JSON here..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              <div className="flex items-center gap-2">
                <button onClick={handleProcess} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Process</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Output..." />
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
