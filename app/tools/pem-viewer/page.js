'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const sampleCert = `-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqEpE9XqIjP1VChjP
v5g8jQpLqIY5eJHJFpQVwQHh+Z0GJzV1j3v6AqDhLxY8tFf2b3QKB7S7TkKP
-----END CERTIFICATE-----`;

function decodePEM(pem) {
  const lines = pem.trim().split('\n');
  const header = lines[0]?.trim() || '';
  const footer = lines[lines.length - 1]?.trim() || '';
  const b64 = lines.slice(1, -1).join('');
  const validB64 = /^[A-Za-z0-9+/=]+$/.test(b64);
  if (!header.startsWith('-----BEGIN ') || !footer.startsWith('-----END ') || !validB64) return null;
  const label = header.replace('-----BEGIN ', '').replace('-----', '');
  return {
    label,
    header,
    footer,
    rawLength: b64.length,
    decodedBytes: Math.floor(b64.length * 0.75),
    valid: true,
  };
}

export default function PemViewerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(sampleCert);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  const handleDecode = useCallback(() => {
    setError('');
    const result = decodePEM(input);
    if (!result) { setError('Invalid PEM format. Must include BEGIN/END headers and valid Base64.'); setInfo(null); return; }
    setInfo(result);
    addEntry('PEM Certificate Viewer');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">PEM Certificate Viewer</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">PEM Data</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <button onClick={handleDecode} className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Decode</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Details</span>
            {info ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Type</span>
                  <span className="font-mono text-text">{info.label}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Header</span>
                  <span className="font-mono text-text text-xs">{info.header}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Footer</span>
                  <span className="font-mono text-text text-xs">{info.footer}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Base64 Length</span>
                  <span className="font-mono text-text">{info.rawLength.toLocaleString()} chars</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Est. Decoded Size</span>
                  <span className="font-mono text-text">~{info.decodedBytes.toLocaleString()} bytes</span>
                </div>
                <div className="mt-3 flex">
                  <CopyButton text={input} className="text-xs" />
                  <span className="text-[10px] text-text-tertiary self-center ml-2">Copy PEM</span>
                </div>
              </div>
            ) : <div className="text-text-tertiary text-sm">Paste a PEM certificate and decode...</div>}
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
