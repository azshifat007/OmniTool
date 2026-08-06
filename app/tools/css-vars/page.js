'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

let idCounter = 0;

export default function CssVarsPage() {
  const { addEntry } = useHistory();
  const [prefix, setPrefix] = useState('--');
  const [vars, setVars] = useState([
    { id: ++idCounter, name: 'primary', value: '#6C5CE7' },
    { id: ++idCounter, name: 'text', value: '#1A1A2E' },
    { id: ++idCounter, name: 'bg', value: '#F8F7F4' },
  ]);
  const [output, setOutput] = useState('');

  const addVar = useCallback(() => {
    setVars(v => [...v, { id: ++idCounter, name: '', value: '' }]);
  }, []);

  const removeVar = useCallback((id) => {
    setVars(v => v.filter(x => x.id !== id));
  }, []);

  const updateVar = useCallback((id, field, val) => {
    setVars(v => v.map(x => x.id === id ? { ...x, [field]: val } : x));
  }, []);

  const generate = useCallback(() => {
    const valid = vars.filter(v => v.name.trim());
    if (!valid.length) { setOutput(''); return; }
    const lines = [':root {'];
    for (const v of valid) {
      const name = prefix === '--' ? `--${v.name.trim()}` : `${prefix}${v.name.trim()}`;
      lines.push(`  ${name}: ${v.value};`);
    }
    lines.push('}');
    setOutput(lines.join('\n'));
    addEntry('CSS Variables Generator');
  }, [vars, prefix, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">--</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Variables Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Prefix</label>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            {vars.map((v, i) => (
              <div key={v.id} className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary w-5">{i + 1}.</span>
                <input value={v.name} onChange={(e) => updateVar(v.id, 'name', e.target.value)} placeholder="name"
                  className="flex-1 bg-surface rounded-lg px-2.5 py-1.5 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <span className="text-text-tertiary text-xs">:</span>
                <input value={v.value} onChange={(e) => updateVar(v.id, 'value', e.target.value)} placeholder="value"
                  className="flex-[2] bg-surface rounded-lg px-2.5 py-1.5 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={() => removeVar(v.id)} className="text-cat-text hover:text-cat-text/80 text-sm cursor-pointer">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={addVar} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">+ Add Variable</button>
              <button onClick={generate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">CSS Output</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[180px]">{output || <span className="text-text-tertiary">Generated CSS variables will appear here...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
