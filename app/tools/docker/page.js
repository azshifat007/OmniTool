'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const services = [
  { name: 'web', image: 'nginx:alpine', ports: ['80:80'], desc: 'Web server' },
  { name: 'api', image: 'node:18-alpine', ports: ['3000:3000'], desc: 'API server' },
  { name: 'db', image: 'postgres:16', ports: ['5432:5432'], env: { POSTGRES_DB: 'app', POSTGRES_PASSWORD: 'secret' }, desc: 'Database' },
  { name: 'cache', image: 'redis:7-alpine', ports: ['6379:6379'], desc: 'Cache' },
];

export default function DockerPage() {
  const { addEntry } = useHistory();
  const [selected, setSelected] = useState(['web', 'db']);
  const [version, setVersion] = useState('3.9');
  const [output, setOutput] = useState('');

  const toggle = useCallback((name) => {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  }, []);

  const generate = useCallback(() => {
    const active = services.filter(s => selected.includes(s.name));
    if (!active.length) { setOutput(''); return; }
    const lines = [`version: '${version}'`, '', 'services:'];
    for (const s of active) {
      lines.push(`  ${s.name}:`);
      lines.push(`    image: ${s.image}`);
      if (s.ports?.length) lines.push(`    ports:\n` + s.ports.map(p => `      - "${p}"`).join('\n'));
      if (s.env) lines.push(`    environment:\n` + Object.entries(s.env).map(([k, v]) => `      ${k}: ${v}`).join('\n'));
      lines.push(`    restart: unless-stopped`);
    }
    setOutput(lines.join('\n'));
    addEntry('Docker Compose Builder');
  }, [selected, version, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Docker Compose Builder</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Compose Version</label>
              <select value={version} onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {['3.8', '3.9'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Services</label>
              <div className="space-y-2">
                {services.map(s => (
                  <label key={s.name} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selected.includes(s.name)} onChange={() => toggle(s.name)}
                      className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                    <div>
                      <span className="text-sm font-medium text-text">{s.name}</span>
                      <span className="text-xs text-text-tertiary ml-2">({s.desc})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">docker-compose.yml</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[200px]">{output || <span className="text-text-tertiary">Select services and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
