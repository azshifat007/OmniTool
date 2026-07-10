'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const UNITS = [
  { label: 'bps', toBps: 1 },
  { label: 'Kbps', toBps: 1000 },
  { label: 'Mbps', toBps: 1e6 },
  { label: 'Gbps', toBps: 1e9 },
  { label: 'Tbps', toBps: 1e12 },
  { label: 'kB/s', toBps: 8000 },
  { label: 'MB/s', toBps: 8e6 },
  { label: 'GB/s', toBps: 8e9 },
];

export default function BwConvertPage() {
  const { addEntry } = useHistory();
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState('Mbps');
  const [to, setTo] = useState('MB/s');

  const convert = useCallback(() => {
    addEntry('Bandwidth Converter');
    const v = parseFloat(value);
    if (isNaN(v) || v < 0) return '';
    const fromUnit = UNITS.find(u => u.label === from);
    const toUnit = UNITS.find(u => u.label === to);
    if (!fromUnit || !toUnit) return '';
    const bps = v * fromUnit.toBps;
    const result = bps / toUnit.toBps;
    return result < 0.001 ? '< 0.001' : result.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [value, from, to, addEntry]);

  const result = convert();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⇅</span>
        <h1 className="font-heading text-2xl font-bold text-text">Bandwidth Converter</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert between bandwidth units: bps, Kbps, Mbps, Gbps, and byte/s rates.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Value</label>
            <input type="number" min={0} step="any" value={value} onChange={(e) => setValue(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {UNITS.map(u => <option key={u.label}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {UNITS.map(u => <option key={u.label}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="text-center pt-4">
            <div className="text-3xl font-bold font-heading text-text">{result} <span className="text-lg text-text-secondary font-normal">{to}</span></div>
            <div className="text-xs text-text-tertiary mt-1">{value} {from}</div>
            <div className="flex justify-center mt-3"><CopyButton text={String(result)} className="text-xs" /></div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
