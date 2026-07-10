'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function textToHex(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function hexToText(hex) {
  const cleaned = hex.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) return null;
  let out = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    out += String.fromCharCode(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return out;
}

export default function HexConverterPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Hello, World!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');

  const convert = useCallback(() => {
    setError('');
    addEntry('Hex Converter');
    if (mode === 'encode') {
      setOutput(textToHex(input));
    } else {
      const result = hexToText(input);
      if (result === null) { setError('Invalid hex input.'); setOutput(''); return; }
      setOutput(result);
    }
  }, [input, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">0x</span>
        <h1 className="font-heading text-2xl font-bold text-text">Hex Converter</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Input</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('encode')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === 'encode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Text → Hex</button>
              <button onClick={() => setMode('decode')}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === 'decode' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>Hex → Text</button>
            </div>
            <button onClick={convert} className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[120px] break-all whitespace-pre-wrap">{output || <span className="text-text-tertiary">Click Convert...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
