'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const breakpoints = [
  { label: 'Mobile (portrait)', min: 0, max: 480 },
  { label: 'Mobile (landscape)', min: 481, max: 768 },
  { label: 'Tablet', min: 769, max: 1024 },
  { label: 'Desktop', min: 1025, max: 1280 },
  { label: 'Wide', min: 1281, max: 1440 },
  { label: 'Ultrawide', min: 1441, max: 9999 },
];

const types = [
  { value: 'min-width', label: 'Min Width (mobile first)' },
  { value: 'max-width', label: 'Max Width (desktop first)' },
  { value: 'between', label: 'Between (range)' },
];

export default function MqBuilderPage() {
  const { addEntry } = useHistory();
  const [type, setType] = useState('min-width');
  const [minBp, setMinBp] = useState('769');
  const [maxBp, setMaxBp] = useState('1024');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    let mq = '';
    if (type === 'min-width') {
      const val = customMin || minBp;
      mq = `@media (min-width: ${val}px) {\n  /* styles */\n}`;
    } else if (type === 'max-width') {
      const val = customMax || maxBp;
      mq = `@media (max-width: ${val}px) {\n  /* styles */\n}`;
    } else {
      const lo = customMin || minBp;
      const hi = customMax || maxBp;
      mq = `@media (min-width: ${lo}px) and (max-width: ${hi}px) {\n  /* styles */\n}`;
    }
    setOutput(mq);
    addEntry('Media Query Builder');
  }, [type, minBp, maxBp, customMin, customMax, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▦</span>
        <h1 className="font-heading text-2xl font-bold text-text">Media Query Builder</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Query Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {type === 'between' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Min Width (px)</label>
                  <input type="number" value={customMin || minBp} onChange={(e) => { setCustomMin(e.target.value); setMinBp('') }}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Max Width (px)</label>
                  <input type="number" value={customMax || maxBp} onChange={(e) => { setCustomMax(e.target.value); setMaxBp('') }}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Breakpoint (px)</label>
                <input type="number" value={customMin || minBp} onChange={(e) => { setCustomMin(e.target.value); setMinBp('') }}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Common Breakpoints</label>
              <div className="flex flex-wrap gap-1.5">
                {breakpoints.map(bp => (
                  <button key={bp.label} onClick={() => { setCustomMin(String(bp.min)); setCustomMax(String(bp.max)); setMinBp(''); setMaxBp(''); }}
                    className="px-2 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text hover:border-text-tertiary transition-all cursor-pointer">{bp.label}</button>
                ))}
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">CSS Output</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[120px]">{output || <span className="text-text-tertiary">Generated query will appear here...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
