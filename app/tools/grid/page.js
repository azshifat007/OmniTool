'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function GridPage() {
  const { addEntry } = useHistory();
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [colGap, setColGap] = useState(8);
  const [rowGap, setRowGap] = useState(8);
  const [colWidth, setColWidth] = useState('1fr');
  const [rowHeight, setRowHeight] = useState('auto');

  const css = `.grid-container {
  display: grid;
  grid-template-columns: ${Array(columns).fill(colWidth).join(' ')};
  grid-template-rows: ${Array(rows).fill(rowHeight).join(' ')};
  gap: ${rowGap}px ${colGap}px;
}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Grid Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="bg-surface rounded-lg border border-border p-4 overflow-auto"
                style={{ display: 'grid', gridTemplateColumns: Array(columns).fill(colWidth).join(' '), gridTemplateRows: Array(rows).fill(rowHeight).join(' '), gap: `${rowGap}px ${colGap}px` }}>
                {Array.from({ length: columns * rows }).map((_, i) => (
                  <div key={i} className="rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono"
                    style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][i % 8], minHeight: 40 }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Settings</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Columns: {columns}</label>
                  <input type="range" min={1} max={8} value={columns} onChange={(e) => setColumns(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Rows: {rows}</label>
                  <input type="range" min={1} max={8} value={rows} onChange={(e) => setRows(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Col width</label>
                  <select value={colWidth} onChange={(e) => setColWidth(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    <option value="1fr">1fr</option>
                    <option value="2fr">2fr</option>
                    <option value="3fr">3fr</option>
                    <option value="auto">auto</option>
                    <option value="100px">100px</option>
                    <option value="150px">150px</option>
                    <option value="200px">200px</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Row height</label>
                  <select value={rowHeight} onChange={(e) => setRowHeight(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-1.5 text-[11px] text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    <option value="auto">auto</option>
                    <option value="1fr">1fr</option>
                    <option value="50px">50px</option>
                    <option value="80px">80px</option>
                    <option value="100px">100px</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Column gap: {colGap}px</label>
                  <input type="range" min={0} max={40} value={colGap} onChange={(e) => setColGap(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-text-tertiary mb-1 block">Row gap: {rowGap}px</label>
                  <input type="range" min={0} max={40} value={rowGap} onChange={(e) => setRowGap(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS</span>
                <CopyButton text={css} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-[11px] font-mono text-text border border-border whitespace-pre-wrap">{css}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
