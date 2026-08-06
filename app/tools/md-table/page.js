'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function MdTablePage() {
  const { addEntry } = useHistory();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [data, setData] = useState(
    Array.from({ length: 3 }, () => Array(3).fill(''))
  );
  const [header, setHeader] = useState(true);
  const [align, setAlign] = useState('left');

  const resize = (nr, nc) => {
    setRows(nr); setCols(nc);
    setData((prev) => Array.from({ length: nr }, (_, r) =>
      Array.from({ length: nc }, (_, c) => prev[r]?.[c] ?? '')
    ));
  };

  const setCell = (r, c, v) => {
    setData((prev) => prev.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? v : cell))));
    addEntry('Markdown Table');
  };

  const markdown = useMemo(() => {
    const esc = (s) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    if (data.length === 0 || data[0].length === 0) return '';
    const hRow = data[0].map((c) => esc(c) || `Col ${1 + data[0].indexOf(c)}`);
    const sepMap = { left: ':---', center: ':---:', right: '---:' };
    const sep = data[0].map(() => sepMap[align]);
    const body = (header ? data.slice(1) : data).map((row) => row.map((c) => esc(c)));
    const fmtRow = (arr) => `| ${arr.join(' | ')} |`;
    const lines = [fmtRow(hRow), fmtRow(sep), ...body.map(fmtRow)];
    return lines.join('\n');
  }, [data, header, align]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">▦</span>
        <h1 className="font-heading text-2xl font-bold text-text">Markdown Table</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Build a Markdown table and copy the generated syntax.</p>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Rows</label>
              <input type="number" min={1} max={20} value={rows}
                onChange={(e) => resize(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)), cols)}
                className="w-20 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Columns</label>
              <input type="number" min={1} max={12} value={cols}
                onChange={(e) => resize(rows, Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
              First row is header
            </label>
            <select value={align} onChange={(e) => setAlign(e.target.value)}
              className="bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
              <option value="left">Align left</option>
              <option value="center">Align center</option>
              <option value="right">Align right</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse">
              <tbody>
                {data.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="p-0.5">
                        <input value={cell} onChange={(e) => setCell(r, c, e.target.value)}
                          placeholder={r === 0 && header ? `Header ${c + 1}` : `Cell ${r + 1}.${c + 1}`}
                          className="w-28 bg-surface rounded px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">Markdown Output</span>
              <CopyButton text={markdown} />
            </div>
            <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text border border-border/50 overflow-x-auto whitespace-pre">{markdown || 'Start typing to build your table…'}</pre>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
