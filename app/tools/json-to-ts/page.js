'use client';
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';

function toTS(obj, name, interfaces) {
  if (obj === null) return 'null';
  const t = typeof obj;
  if (['string', 'number', 'boolean'].includes(t)) return t;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'any[]';
    const types = [...new Set(obj.map(item => toTS(item, name + 'Item', interfaces)))];
    return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
  }

  if (t === 'object') {
    const iname = name;
    if (interfaces[iname]) return iname;
    interfaces[iname] = null;
    const props = Object.entries(obj).map(([key, val]) => {
      const pk = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
      const pt = toTS(val, name + '_' + key.replace(/[^a-zA-Z0-9]/g, '_'), interfaces);
      return `  ${pk}: ${pt};`;
    });
    interfaces[iname] = `export interface ${iname} {\n${props.join('\n')}\n}\n`;
    return iname;
  }

  return 'any';
}

function generate(json, rootName) {
  try {
    const obj = JSON.parse(json);
    const interfaces = {};
    toTS(obj, rootName, interfaces);
    return Object.values(interfaces).filter(Boolean).join('\n');
  } catch {
    return null;
  }
}

export default function JsonToTSPage() {
  const [json, setJson] = useState('{\n  "name": "John",\n  "age": 30,\n  "email": "john@example.com",\n  "active": true\n}');
  const [name, setName] = useState('User');
  const [error, setError] = useState(false);

  const output = useMemo(() => {
    if (!json.trim()) return '';
    const result = generate(json, name);
    setError(result === null);
    return result || '';
  }, [json, name]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">TS</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON to TypeScript</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-text-tertiary">Root name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value || 'Root')}
              className="bg-surface text-text rounded-lg border border-border px-3 py-1.5 text-sm font-mono outline-none focus:border-primary/50 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">JSON Input</label>
              <textarea value={json} onChange={e => setJson(e.target.value)} rows={15}
                className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono resize-none outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-tertiary">TypeScript Output</label>
                {output && <CopyButton text={output} />}
              </div>
              <div className="w-full h-[382px] bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {output || <span className="text-text-tertiary">Generated types will appear here</span>}
              </div>
            </div>
          </div>
          {error && <div className="text-xs text-cat-text">Invalid JSON — check the format</div>}
        </div>
      </GlassCard>
    </motion.div>
  );
}
