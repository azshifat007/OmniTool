'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function CsvViewerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Name,Age,City\nAlice,30,NYC\nBob,25,San Francisco\nCarol,35,Los Angeles\nDave,28,Chicago');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const parse = useCallback(() => {
    setError('');
    const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 1) { setError('Paste CSV data first.'); setData(null); return; }
    const parsed = lines.map(l => {
      const row = [];
      let current = '';
      let inQuotes = false;
      for (const ch of l) {
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === ',' && !inQuotes) { row.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      row.push(current.trim());
      return row;
    });
    const colCount = Math.max(...parsed.map(r => r.length));
    if (parsed.some(r => r.length !== colCount)) { setError('Rows have inconsistent column counts.'); setData(null); return; }
    setData(parsed);
    addEntry('CSV Viewer');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">▦</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSV Viewer</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">CSV Data</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <button onClick={parse} className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Parse & View</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Table View</span>
            {data ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>{data[0].map((h, i) => <th key={i} className="border border-border px-3 py-2 text-left text-xs font-semibold text-text bg-surface">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-surface/50' : ''}>
                        {row.map((cell, ci) => <td key={ci} className="border border-border px-3 py-1.5 text-xs text-text">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-text-tertiary mt-3">{data.length - 1} rows, {data[0].length} cols</div>
              </div>
            ) : <div className="text-text-tertiary text-sm">Paste CSV and click Parse...</div>}
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
