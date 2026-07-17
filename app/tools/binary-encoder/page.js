'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function textToRadix(str, radix, pad) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(radix).padStart(pad, '0')).join(' ');
}

function radixToText(txt, radix, pad) {
  const cleaned = txt.replace(/\s+/g, '');
  if (!new RegExp(`^[0-${radix > 10 ? '9a-f' : radix - 1}]*$`, 'i').test(cleaned) || cleaned.length % pad !== 0) return null;
  let out = '';
  for (let i = 0; i < cleaned.length; i += pad) {
    out += String.fromCharCode(parseInt(cleaned.slice(i, i + pad), radix));
  }
  return out;
}

function textToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToText(str) {
  try {
    return decodeURIComponent(escape(atob(str.trim())));
  } catch {
    return null;
  }
}

export default function BinaryEncoderPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Hello!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('bin');
  const [error, setError] = useState('');

  const convert = useCallback(() => {
    setError('');
    addEntry('Binary Encoder');
    if (mode === 'text') {
      if (input.trim() === '') { setError('Enter encoded text to decode.'); setOutput(''); return; }
      if (input.includes(' ')) {
        const result = radixToText(input, 2, 8);
        if (result === null) { setError('Invalid binary input.'); setOutput(''); return; }
        setOutput(result);
      } else {
        const result = base64ToText(input);
        if (result === null) { setError('Invalid Base64 input.'); setOutput(''); return; }
        setOutput(result);
      }
    } else {
      if (mode === 'bin') setOutput(textToRadix(input, 2, 8));
      else if (mode === 'hex') setOutput(textToRadix(input, 16, 2));
      else if (mode === 'oct') setOutput(textToRadix(input, 8, 3));
      else if (mode === 'b64') setOutput(textToBase64(input));
    }
  }, [input, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">01</span>
        <h1 className="font-heading text-2xl font-bold text-text">Binary Encoder</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Input</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { k: 'bin', l: 'Text → Binary' },
                { k: 'hex', l: 'Text → Hex' },
                { k: 'oct', l: 'Text → Octal' },
                { k: 'b64', l: 'Text → Base64' },
                { k: 'text', l: 'Decode' },
              ].map(o => (
                <button key={o.k} onClick={() => setMode(o.k)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === o.k ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{o.l}</button>
              ))}
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
