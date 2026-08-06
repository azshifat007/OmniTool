'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const types = ['Added', 'Changed', 'Fixed', 'Deprecated', 'Removed', 'Security'];

export default function ChangelogPage() {
  const { addEntry } = useHistory();
  const [entries, setEntries] = useState([
    { type: 'Added', message: 'New changelog generator tool' },
    { type: 'Fixed', message: 'Fixed responsive layout on mobile' },
  ]);
  const [version, setVersion] = useState('1.0.0');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [live, setLive] = useState(true);

  const addEntry_ = useCallback(() => {
    setEntries(e => [...e, { type: 'Added', message: '' }]);
  }, []);

  const removeEntry = useCallback((i) => {
    setEntries(e => e.filter((_, idx) => idx !== i));
  }, []);

  const updateEntry = useCallback((i, field, val) => {
    setEntries(e => e.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  }, []);

  const output = useMemo(() => {
    const valid = entries.filter(e => e.message.trim());
    if (!valid.length) return '';
    const lines = [`## [${version}] - ${date}`, ''];
    for (const t of types) {
      const items = valid.filter(e => e.type === t).map(e => e.message.trim());
      if (!items.length) continue;
      lines.push(`### ${t}`);
      for (const msg of items) lines.push(`- ${msg}`);
      lines.push('');
    }
    return lines.join('\n');
  }, [entries, version, date]);

  const handleGenerate = useCallback(() => {
    addEntry('Changelog Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">≡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Changelog Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Version</label>
                <input value={version} onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2.5 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2.5 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            {entries.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={e.type} onChange={(ev) => updateEntry(i, 'type', ev.target.value)}
                  className="bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={e.message} onChange={(ev) => updateEntry(i, 'message', ev.target.value)} placeholder="Description"
                  className="flex-1 bg-surface rounded-lg px-2.5 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={() => removeEntry(i)} className="text-cat-text hover:text-cat-text/80 text-sm cursor-pointer">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={addEntry_} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">+ Add Entry</button>
              <button onClick={handleGenerate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Log</button>
              <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer ml-auto">
                <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} className="accent-primary rounded" />
                Live
              </label>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">CHANGELOG.md</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[200px]">{live ? (output || <span className="text-text-tertiary">Add entries to preview...</span>) : <span className="text-text-tertiary">Click "Log" to generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
