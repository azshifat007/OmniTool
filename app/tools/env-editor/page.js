'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function EnvEditorPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('DATABASE_URL=postgres://localhost:5432/db\nAPI_KEY=sk-abc123\nNODE_ENV=development\nPORT=3000');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');

  const parse = useCallback(() => {
    setError('');
    const lines = input.split('\n');
    const result = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) {
        result.push({ key: '', value: '', raw: line, comment: line.startsWith('#') });
        continue;
      }
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) { setError(`Invalid line (no "="): ${line}`); setParsed(null); return; }
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (!key) { setError(`Empty key on line: ${line}`); setParsed(null); return; }
      result.push({ key, value: val, raw: line });
    }
    setParsed(result);
    addEntry('Env File Editor');
  }, [input, addEntry]);

  const asJson = useCallback(() => {
    if (!parsed) return '';
    const obj = {};
    for (const p of parsed) if (p.key) obj[p.key] = p.value;
    return JSON.stringify(obj, null, 2);
  }, [parsed]);

  const asExport = useCallback(() => {
    if (!parsed) return '';
    return parsed.filter(p => p.key).map(p => `export ${p.key}="${p.value}"`).join('\n');
  }, [parsed]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⚙</span>
        <h1 className="font-heading text-2xl font-bold text-text">Env File Editor</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">.env Content</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <button onClick={parse} className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Parse</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Parsed Variables</span>
            {parsed ? (
              <div className="space-y-1.5 mb-3">
                {parsed.filter(p => p.key).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="font-mono font-medium text-cat-code">{p.key}</span>
                    <span className="font-mono text-text-secondary truncate ml-4 max-w-[200px]">{p.value}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <CopyButton text={asJson()} className="text-xs" />
                  <span className="text-[10px] text-text-tertiary self-center">as JSON</span>
                  <CopyButton text={asExport()} className="text-xs" />
                  <span className="text-[10px] text-text-tertiary self-center">as Export</span>
                </div>
              </div>
            ) : <div className="text-text-tertiary text-sm">Click Parse to see variables...</div>}
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
