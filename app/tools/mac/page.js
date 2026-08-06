'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function randomByte() {
  return Math.floor(Math.random() * 256);
}

function formatMac(bytes, separator, upper) {
  const parts = bytes.map(b => b.toString(16).padStart(2, '0'));
  const joined = parts.join(separator);
  return upper ? joined.toUpperCase() : joined;
}

export default function MacPage() {
  const { addEntry } = useHistory();
  const [format, setFormat] = useState('colon');
  const [upper, setUpper] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [count, setCount] = useState(5);
  const [macs, setMacs] = useState([]);
  const [error, setError] = useState('');

  const separatorMap = { colon: ':', hyphen: '-', plain: '' };
  const formatLabels = { colon: 'XX:XX:XX:XX:XX:XX', hyphen: 'XX-XX-XX-XX-XX-XX', plain: 'XXXXXXXXXXXX' };

  const generate = useCallback(() => {
    setError('');
    const n = Math.min(Math.max(count, 1), 20);
    const sep = separatorMap[format];
    const parsed = [];
    if (prefix.trim()) {
      const raw = prefix.trim().replace(/[^0-9a-fA-F]/g, '');
      if (raw.length !== 6) {
        setError('OUI prefix must be exactly 3 bytes (6 hex chars).');
        return;
      }
      for (let i = 0; i < 3; i++) parsed.push(parseInt(raw.slice(i * 2, i * 2 + 2), 16));
    }
    const result = [];
    for (let i = 0; i < n; i++) {
      const bytes = parsed.length ? [...parsed] : [];
      while (bytes.length < 6) bytes.push(randomByte());
      result.push(formatMac(bytes, sep, upper));
    }
    setMacs(result);
    addEntry('MAC Address Generator');
  }, [count, format, upper, prefix, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">🔌</span>
        <h1 className="font-heading text-2xl font-bold text-text">MAC Address Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Format:</span>
              {Object.entries(formatLabels).map(([key, label]) => (
                <button key={key} onClick={() => setFormat(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    format === key ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{label}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={upper} onChange={() => setUpper(!upper)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary" />
              <span className="text-xs text-text">Uppercase</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">OUI Prefix (optional):</span>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="00:1A:2B"
                className="w-28 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Count:</span>
              <input type="number" min={1} max={20} value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-16 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
            </div>
            <button onClick={generate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer ml-auto">Generate Random MAC</button>
          </div>
        </div>
      </GlassCard>

      {macs.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated MAC Addresses ({macs.length})</span>
              <CopyButton text={macs.join('\n')} />
            </div>
            <div className="space-y-1">
              {macs.map((mac, i) => (
                <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text flex items-center gap-3 border border-border/50">
                  <span className="text-text-tertiary text-xs">#{i + 1}</span>
                  <span className="flex-1">{mac}</span>
                  <CopyButton text={mac} />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
