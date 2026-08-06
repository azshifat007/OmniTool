'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

function convert(value, from, to, base) {
  if (from === to) return value;
  const fromIdx = units.indexOf(from);
  const toIdx = units.indexOf(to);
  const diff = toIdx - fromIdx;
  return value / Math.pow(base, diff);
}

export default function DataSizePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('1');
  const [fromUnit, setFromUnit] = useState('GB');
  const [base, setBase] = useState(1024);
  const [error, setError] = useState('');

  const results = useMemo(() => {
    setError('');
    const val = parseFloat(input);
    if (input === '' || isNaN(val) || val < 0) {
      if (input !== '') setError('Enter a valid positive number.');
      return null;
    }
    const converted = {};
    for (const u of units) converted[u] = convert(val, fromUnit, u, base);
    addEntry('Data Size Converter');
    return converted;
  }, [input, fromUnit, base, addEntry]);

  const getBits = () => {
    if (!results) return '';
    const bytes = results['B'];
    return Math.round(bytes * 8).toLocaleString();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">⇅</span>
        <h1 className="font-heading text-2xl font-bold text-text">Data Size Converter</h1>
      </div>
      <GlassCard>
        <div className="p-4">
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-text-tertiary mb-2 block">Value</label>
              <input type="number" min="0" step="any" value={input} onChange={(e) => setInput(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="w-28">
              <label className="text-xs text-text-tertiary mb-2 block">From</label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {[1024, 1000].map(b => (
              <button key={b} onClick={() => setBase(b)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${base === b ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>
                {b === 1024 ? 'Binary (1024)' : 'Decimal (1000)'}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
      {results && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4 space-y-1.5">
              {units.map((u) => (
                <div key={u} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-sm font-medium text-text">{u}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-text-secondary">{results[u] < 0.001 ? '< 0.001' : results[u].toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                    <CopyButton text={String(results[u] < 0.001 ? '< 0.001' : results[u].toLocaleString(undefined, { maximumFractionDigits: 4 }))} className="text-[10px]" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium text-text">Bits</span>
                <span className="text-sm font-mono text-text">{getBits()}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
