'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function HmacPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState('hex');

  const handleGenerate = useCallback(async () => {
    if (!input || !secret) return;
    addEntry('HMAC Generator');
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: algo }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
      const hashArr = Array.from(new Uint8Array(sig));
      setOutput(format === 'hex'
        ? hashArr.map(b => b.toString(16).padStart(2, '0')).join('')
        : btoa(String.fromCharCode(...hashArr))
      );
    } catch {
      setOutput('Error generating HMAC');
    }
  }, [input, secret, algo, format, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">HMAC Generator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex items-center gap-3">
            {['SHA-256', 'SHA-384', 'SHA-512'].map(a => (
              <button key={a} onClick={() => setAlgo(a)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  algo === a ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{a}</button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Output:</span>
              {['hex', 'base64'].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    format === f ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Message</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Enter message to sign..." />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Secret Key</label>
              <input type="text" value={secret} onChange={e => setSecret(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter secret key..." />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">HMAC Signature</span>
              <div className="flex items-center gap-2">
                <button onClick={handleGenerate} disabled={!input || !secret}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">Generate</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={6}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Signature will appear here..." />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
