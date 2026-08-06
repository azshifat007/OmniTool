'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function xorEncrypt(text, key) {
  if (!text || !key) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += String.fromCharCode(code);
  }
  return out;
}

function toHex(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function fromHex(hex) {
  const cleaned = hex.replace(/\s+/g, '');
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) return '';
  let out = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    out += String.fromCharCode(parseInt(cleaned.slice(i, i + 2), 16));
  }
  return out;
}

export default function XorCipherPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Hello, XOR!');
  const [key, setKey] = useState('key');
  const [result, setResult] = useState('');
  const [hex, setHex] = useState('');

  const encrypt = useCallback(() => {
    addEntry('XOR Cipher');
    const enc = xorEncrypt(input, key);
    setResult(enc);
    setHex(toHex(enc));
  }, [input, key, addEntry]);

  const decrypt = useCallback(() => {
    addEntry('XOR Cipher');
    const text = hex.match(/^[0-9a-fA-F\s]+$/) ? fromHex(hex) : input;
    const dec = xorEncrypt(text, key);
    setResult(dec);
    setHex(text !== hex ? '' : toHex(xorEncrypt(fromHex(hex), key)));
  }, [input, hex, key, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚔</span>
        <h1 className="font-heading text-2xl font-bold text-text">XOR Cipher</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Input Text</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">XOR Key</label>
              <input value={key} onChange={(e) => setKey(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Hex Input (for decode)</label>
              <input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="e.g. 2a 0a 0d 0d 0e"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={encrypt} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Encrypt</button>
              <button onClick={decrypt} className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-surface text-text border border-border hover:border-primary transition-all cursor-pointer">Decrypt</button>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary">Output</span>
                {result && <CopyButton text={result} className="text-xs" />}
              </div>
              <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text leading-relaxed border border-border/50 min-h-[80px] break-all whitespace-pre-wrap">{result || <span className="text-text-tertiary">Result appears here...</span>}</pre>
            </div>
            {hex && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-tertiary">Hex</span>
                  <CopyButton text={hex} className="text-xs" />
                </div>
                <pre className="bg-surface rounded-xl p-3 text-xs font-mono text-text leading-relaxed border border-border/50 break-all">{hex}</pre>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
