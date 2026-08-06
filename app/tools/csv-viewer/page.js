'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseCsv(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
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
  if (parsed.some(r => r.length !== colCount)) throw new Error('Rows have inconsistent column counts.');
  return parsed;
}

export default function CsvViewerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Name,Age,City\nAlice,30,NYC\nBob,25,San Francisco\nCarol,35,Los Angeles\nDave,28,Chicago');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  const parse = useCallback(() => {
    setError('');
    try {
      const parsed = parseCsv(input);
      setData(parsed);
      addEntry('CSV Viewer');
    } catch (e) {
      setError(e.message);
      setData(null);
    }
  }, [input, addEntry]);

  const sortedRows = useMemo(() => {
    if (!data || sortCol === null) return data ? data.slice(1) : [];
    const rows = data.slice(1);
    return [...rows].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * sortDir;
      return String(va).localeCompare(String(vb)) * sortDir;
    });
  }, [data, sortCol, sortDir]);

  const numericStats = useMemo(() => {
    if (!data) return [];
    return data[0].map((h, ci) => {
      const nums = data.slice(1).map(r => parseFloat(r[ci])).filter(n => !isNaN(n));
      if (nums.length < 2) return null;
      const sum = nums.reduce((a, b) => a + b, 0);
      return { col: h, min: Math.min(...nums), max: Math.max(...nums), avg: (sum / nums.length).toFixed(1), count: nums.length };
    });
  }, [data]);

  const handleSort = (i) => {
    if (sortCol === i) setSortDir(d => -d);
    else { setSortCol(i); setSortDir(1); }
  };

  const jsonText = data ? JSON.stringify(
    sortedRows.map(r => Object.fromEntries(data[0].map((h, i) => [h, r[i]]))), null, 2
  ) : '';

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
            <div className="flex items-center gap-2 mt-3">
              <button onClick={parse} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Parse & View</button>
              {data && <CopyButton text={jsonText} className="text-xs" />}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Table View</span>
            {data ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>{data[0].map((h, i) => (
                      <th key={i} onClick={() => handleSort(i)}
                        className="border border-border px-3 py-2 text-left text-xs font-semibold text-text bg-surface cursor-pointer hover:text-primary transition-colors select-none">
                        {h}{sortCol === i ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
                      </th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-surface/50' : ''}>
                        {row.map((cell, ci) => <td key={ci} className="border border-border px-3 py-1.5 text-xs text-text">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-text-tertiary mt-3">{data.length - 1} rows, {data[0].length} cols · click header to sort</div>
              </div>
            ) : <div className="text-text-tertiary text-sm">Paste CSV and click Parse...</div>}
          </div>
        </GlassCard>
      </div>
      {data && numericStats.some(Boolean) && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Numeric Column Stats</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {numericStats.map((s, i) => s && (
                <div key={i} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <div className="text-xs font-semibold text-text mb-1">{s.col}</div>
                  <div className="text-[11px] text-text-tertiary font-mono">min {s.min} · max {s.max} · avg {s.avg}</div>
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
