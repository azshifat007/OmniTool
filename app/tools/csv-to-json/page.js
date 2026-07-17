'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export default function CsvToJsonPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('name,age,city\nAlice,30,NYC\nBob,25,LA');
  const [mode, setMode] = useState('objects');
  const [error, setError] = useState('');

  const { headers, json } = useMemo(() => {
    try {
      const rows = parseCsv(input);
      if (rows.length === 0) return { headers: [], json: '' };
      const headerRow = rows[0];
      const body = rows.slice(1);
      const objs = body.map((r) => {
        const o = {};
        headerRow.forEach((h, i) => { o[h] = r[i] ?? ''; });
        return o;
      });
      const arr = body.map((r) => r.map((c) => c));
      const out = mode === 'objects' ? objs : mode === 'arrays' ? arr : headerRow;
      return { headers: headerRow, json: JSON.stringify(out, null, 2) };
    } catch (e) {
      setError('Could not parse CSV: ' + e.message);
      return { headers: [], json: '' };
    }
  }, [input, mode]);

  const onChange = (e) => { setInput(e.target.value); addEntry('CSV to JSON'); setError(''); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇅</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSV to JSON</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert CSV into JSON objects, arrays, or headers.</p>

          <div>
            <label className="text-xs text-text-tertiary block mb-2">CSV Input</label>
            <textarea value={input} onChange={onChange} rows={5}
              className="w-full bg-surface rounded-xl px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none resize-none leading-relaxed" />
          </div>

          <div className="flex gap-2">
            {['objects', 'arrays', 'headers'].map((m) => (
              <button key={m} onClick={() => { setMode(m); addEntry('CSV to JSON'); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                  mode === m ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
                }`}>
                {m === 'objects' ? 'Objects' : m === 'arrays' ? 'Arrays' : 'Headers'}
              </button>
            ))}
          </div>

          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}

          {json && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary uppercase tracking-wide font-semibold">JSON Output</span>
                <CopyButton text={json} />
              </div>
              <pre className="bg-surface rounded-xl p-4 text-sm font-mono text-text border border-border/50 overflow-x-auto whitespace-pre">{json}</pre>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
