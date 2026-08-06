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

  const allResults = UNITS.map(u => {
    const fromUnit = UNITS.find(x => x.label === from);
    const v = parseFloat(value);
    const bps = isNaN(v) ? 0 : v * fromUnit.toBps;
    const r = bps / u.toBps;
    return { label: u.label, val: isNaN(v) || v < 0 ? '--' : r < 0.001 ? '< 0.001' : r.toLocaleString(undefined, { maximumFractionDigits: 4 }) };
  });

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
              <div className="flex gap-2">
                <select value={to} onChange={(e) => setTo(e.target.value)}
                  className="flex-1 bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  {UNITS.map(u => <option key={u.label}>{u.label}</option>)}
                </select>
                <button onClick={() => { setFrom(to); setTo(from); }}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">⇅</button>
              </div>
            </div>
          </div>
          <div className="text-center pt-4">
            <div className="text-3xl font-bold font-heading text-text">{result} <span className="text-lg text-text-secondary font-normal">{to}</span></div>
            <div className="text-xs text-text-tertiary mt-1">{value} {from}</div>
            <div className="flex justify-center mt-3"><CopyButton text={String(result)} className="text-xs" /></div>
          </div>
        </div>
      </GlassCard>
      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">All Conversions</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allResults.map(r => (
              <div key={r.label} className={`bg-surface rounded-lg px-3 py-2 border ${r.label === to ? 'border-primary/40' : 'border-border/50'}`}>
                <div className="text-[10px] text-text-tertiary">{r.label}</div>
                <div className="text-xs font-mono font-bold text-text truncate">{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
