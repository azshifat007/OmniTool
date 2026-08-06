'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function UrlEncodePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [live, setLive] = useState(true);
  const [error, setError] = useState('');

  const process = useCallback((val, m) => {
    if (!val) { setOutput(''); setError(''); return; }
    setError('');
    try {
      if (m === 'encode') {
        setOutput(encodeURIComponent(val));
      } else {
        setOutput(decodeURIComponent(val));
      }
      addEntry('URL Encode/Decode');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [addEntry]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (live) process(val, mode);
  };

  const handleMode = (m) => {
    setMode(m);
    if (live && input) process(input, m);
  };

  const handleProcess = () => process(input, mode);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">%</span>
        <h1 className="font-heading text-2xl font-bold text-text">URL Encode / Decode</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {['encode', 'decode'].map((m) => (
                <button key={m} onClick={() => handleMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{m === 'encode' ? 'Encode' : 'Decode'}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer ml-auto">
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)}
                className="accent-primary" />
              Live
            </label>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Input</label>
            <textarea value={input} onChange={handleInput} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={mode === 'encode' ? 'Enter text to URL-encode...' : 'Enter URL-encoded text to decode...'} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              <div className="flex items-center gap-2">
                {!live && <button onClick={handleProcess} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">{mode === 'encode' ? 'Encode' : 'Decode'}</button>}
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Result will appear here..." />
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
