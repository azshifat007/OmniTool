'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TableGenPage() {
  const { addEntry } = useHistory();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headers, setHeaders] = useState(['Name', 'Age', 'City']);
  const [data, setData] = useState([['Alice', '30', 'NYC'], ['Bob', '25', 'SF'], ['Carol', '35', 'LA']]);
  const [output, setOutput] = useState('');

  const updateHeader = useCallback((i, val) => {
    setHeaders(h => h.map((x, idx) => idx === i ? val : x));
  }, []);

  const updateCell = useCallback((r, c, val) => {
    setData(d => d.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? val : cell)));
  }, []);

  const addRow = useCallback(() => {
    setRows(r => r + 1);
    setData(d => [...d, Array(cols).fill('')]);
  }, [cols]);

  const addCol = useCallback(() => {
    setCols(c => c + 1);
    setHeaders(h => [...h, '']);
    setData(d => d.map(row => [...row, '']));
  }, []);

  const generate = useCallback(() => {
    const lines = ['<table>'];
    if (headers.some(h => h.trim())) {
      lines.push('  <thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>');
    }
    lines.push('  <tbody>');
    for (const row of data) {
      if (row.every(c => !c.trim())) continue;
      lines.push('    <tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>');
    }
    lines.push('  </tbody>');
    lines.push('</table>');
    setOutput(lines.join('\n') + '\n\n<!-- style -->\n<style>\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ccc; padding: 8px; text-align: left; }\nth { background: #f5f5f5; }\n</style>');
    addEntry('HTML Table Generator');
  }, [headers, data, addEntry]);

  const removeRow = useCallback((i) => {
    setData(d => d.filter((_, idx) => idx !== i));
    setRows(r => r - 1);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML Table Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex gap-2 text-xs text-text-tertiary mb-1">
              <span>{rows} rows</span>
              <span>{cols} cols</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="border border-border p-1"><input value={h} onChange={(e) => updateHeader(i, e.target.value)} placeholder={`Header ${i + 1}`} className="w-full bg-transparent text-text text-xs text-center focus:outline-none" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-border p-1"><input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} className="w-full bg-transparent text-text text-xs text-center focus:outline-none" /></td>
                      ))}
                      <td className="p-1"><button onClick={() => removeRow(ri)} className="text-cat-text text-xs cursor-pointer">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button onClick={addRow} className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">+ Row</button>
              <button onClick={addCol} className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">+ Column</button>
              <button onClick={generate} className="px-3 py-1 text-[10px] font-medium rounded-md bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer ml-auto">Generate</button>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">HTML Output</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[200px]">{output || <span className="text-text-tertiary">Configure table and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
