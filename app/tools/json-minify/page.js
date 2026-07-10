'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function JsonMinifyPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('minify');

  const handleProcess = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const parsed = JSON.parse(input);
      const result = mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setOutput(result);
      setError('');
      addEntry('JSON Minifier');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">{}</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON Minifier</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex items-center gap-3">
            {['minify', 'beautify'].map(m => (
              <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>
                {m === 'minify' ? 'Minify' : 'Beautify'}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">JSON Input</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={12}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder='{"key": "value", "nested": {"hello": "world"}}' />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">
                {mode === 'minify' ? 'Minified Output' : 'Beautified Output'}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleProcess} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Process</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output || error} readOnly rows={12}
              className={`w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono border resize-none ${
                error ? 'text-cat-text border-cat-text/30' : 'text-text border-border'
              }`}
              placeholder="Output will appear here..." />
          </div>
        </GlassCard>
      </div>

      {output && !error && (
        <GlassCard className="mt-4">
          <div className="p-3 flex items-center justify-between text-xs text-text-tertiary">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
            <span className="text-cat-success">Saved {input.length - output.length} chars ({(input.length > 0 ? ((1 - output.length / input.length) * 100).toFixed(1) : 0)}%)</span>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
