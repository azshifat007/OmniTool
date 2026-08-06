'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function ExponentPage() {
  const { addEntry } = useHistory();
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const [root, setRoot] = useState('16');
  const [rootN, setRootN] = useState('2');
  const [logVal, setLogVal] = useState('100');
  const [logBase, setLogBase] = useState('10');

  const power = useCallback(() => {
    addEntry('Exponent Calculator');
    const b = parseFloat(base);
    const e = parseFloat(exp);
    if (isNaN(b) || isNaN(e)) return '';
    return Math.pow(b, e).toPrecision(10);
  }, [base, exp, addEntry]);

  const calcRoot = useCallback(() => {
    addEntry('Exponent Calculator');
    const v = parseFloat(root);
    const n = parseFloat(rootN);
    if (isNaN(v) || isNaN(n) || n === 0) return '';
    return Math.pow(v, 1 / n).toPrecision(10);
  }, [root, rootN, addEntry]);

  const calcLog = useCallback(() => {
    addEntry('Exponent Calculator');
    const v = parseFloat(logVal);
    const b = parseFloat(logBase);
    if (isNaN(v) || isNaN(b) || b <= 0 || b === 1 || v <= 0) return '';
    return (Math.log(v) / Math.log(b)).toPrecision(10);
  }, [logVal, logBase, addEntry]);

  const p = power();
  const r = calcRoot();
  const lg = calcLog();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">ⁿ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Exponent Calculator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Power</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-tertiary">Base</label>
                <input type="number" value={base} onChange={(e) => setBase(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">Exponent</label>
                <input type="number" value={exp} onChange={(e) => setExp(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="text-center text-lg font-mono text-text">{base}<sup>{exp}</sup> = {p}</div>
            <CopyButton text={String(p)} className="text-[10px]" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Nth Root</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-tertiary">Value</label>
                <input type="number" value={root} onChange={(e) => setRoot(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">N</label>
                <input type="number" value={rootN} onChange={(e) => setRootN(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="text-center text-lg font-mono text-text">√[{rootN}]{root} = {r}</div>
            <CopyButton text={String(r)} className="text-[10px]" />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Logarithm</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-text-tertiary">Value</label>
                <input type="number" value={logVal} onChange={(e) => setLogVal(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">Base</label>
                <input type="number" value={logBase} onChange={(e) => setLogBase(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="text-center text-lg font-mono text-text">log[{logBase}]({logVal}) = {lg}</div>
            <CopyButton text={String(lg)} className="text-[10px]" />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
