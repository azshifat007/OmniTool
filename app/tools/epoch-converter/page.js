'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function pad(n, l = 2) { return String(n).padStart(l, '0'); }

export default function EpochConverterPage() {
  const { addEntry } = useHistory();
  const now = Math.floor(Date.now() / 1000);
  const [epoch, setEpoch] = useState(String(now));
  const [dateStr, setDateStr] = useState('');
  const [ms, setMs] = useState(false);

  const fromEpoch = useMemo(() => {
    const n = parseInt(epoch, 10);
    if (isNaN(n)) return null;
    const msVal = ms ? n : n * 1000;
    const d = new Date(msVal);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [epoch, ms]);

  const toEpoch = useMemo(() => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getTime() / (ms ? 1 : 1000));
  }, [dateStr, ms]);

  const fmt = (d) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;

  const localFmt = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} (local)`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Epoch Converter</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert between Unix timestamps and human-readable dates.</p>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer w-fit mx-auto">
            <input type="checkbox" checked={ms} onChange={(e) => setMs(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
            Treat input as milliseconds
          </label>

          <div>
            <label className="text-xs text-text-tertiary block mb-2">Unix Timestamp {ms ? '(ms)' : '(seconds)'}</label>
            <div className="flex gap-2">
              <input value={epoch} onChange={(e) => { setEpoch(e.target.value); addEntry('Epoch Converter'); }}
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none font-mono" />
              <button onClick={() => { setEpoch(String(Math.floor(Date.now() / (ms ? 1 : 1000)))); addEntry('Epoch Converter'); }}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:border-primary transition-all cursor-pointer">
                Now
              </button>
            </div>
            {fromEpoch && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <span className="text-xs text-text-tertiary">UTC</span>
                  <span className="text-sm font-mono text-text">{fmt(fromEpoch)}</span>
                </div>
                <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <span className="text-xs text-text-tertiary">Local</span>
                  <span className="text-sm font-mono text-text">{localFmt(fromEpoch)}</span>
                </div>
                <div className="flex justify-end">
                  <CopyButton text={`${fmt(fromEpoch)}\n${localFmt(fromEpoch)}`} className="text-xs" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-xs text-text-tertiary block mb-2">Date / Time String</label>
            <input
              type="datetime-local"
              value={dateStr ? dateStr.slice(0, 16) : ''}
              onChange={(e) => { setDateStr(e.target.value); addEntry('Epoch Converter'); }}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer" />
            {toEpoch !== null && (
              <div className="mt-2 flex items-center justify-between bg-surface rounded-lg px-3 py-2 border border-border/50">
                <span className="text-xs text-text-tertiary">→ Timestamp</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text">{toEpoch}</span>
                  <CopyButton text={String(toEpoch)} className="text-xs" />
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
