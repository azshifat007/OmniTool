'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function K8sSecretPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('app-secret');
  const [entries, setEntries] = useState([{ key: 'DATABASE_PASSWORD', val: 's3cret!' }, { key: 'API_KEY', val: 'sk-abc123' }]);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    addEntry('K8s Secret Generator');
    const dataLines = entries.filter(e => e.key.trim()).map(e => {
      const b64 = btoa(e.val);
      return `  ${e.key.trim()}: ${b64}`;
    }).join('\n');
    const yaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${name.trim() || 'app-secret'}
type: Opaque
data:
${dataLines}`;
    setOutput(yaml);
  }, [name, entries, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s Secret Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-secondary">Values are automatically Base64-encoded per Kubernetes requirements.</p>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Data</label>
              {entries.map((e, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={e.key} onChange={(e2) => { const n = [...entries]; n[i] = { ...n[i], key: e2.target.value }; setEntries(n); }} placeholder="Key"
                    className="w-40 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <input value={e.val} onChange={(e2) => { const n = [...entries]; n[i] = { ...n[i], val: e2.target.value }; setEntries(n); }} placeholder="Value (plaintext)"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => { if (entries.length > 1) setEntries(entries.filter((_, j) => j !== i)); }} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === entries.length - 1 && <button onClick={() => setEntries([...entries, { key: '', val: '' }])} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">secret.yaml</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
