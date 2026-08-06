'use client';

import { useState, useMemo, useCallback } from 'react';
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
  const [envOverrides, setEnvOverrides] = useState({});

  const toggle = useCallback((name) => {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  }, []);

  const output = useMemo(() => {
    const active = services.filter(s => selected.includes(s.name));
    if (!active.length) return '';
    const lines = [`version: '${version}'`, '', 'services:'];
    for (const s of active) {
      lines.push(`  ${s.name}:`);
      lines.push(`    image: ${s.image}`);
      if (s.ports?.length) lines.push(`    ports:\n` + s.ports.map(p => `      - "${p}"`).join('\n'));
      if (s.env) {
        const env = { ...s.env, ...(envOverrides[s.name] || {}) };
        lines.push(`    environment:\n` + Object.entries(env).map(([k, v]) => `      ${k}: ${v}`).join('\n'));
      }
      lines.push(`    restart: unless-stopped`);
    }
    addEntry('Docker Compose Builder');
    return lines.join('\n');
  }, [selected, version, envOverrides, addEntry]);

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
                  <div key={s.name} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selected.includes(s.name)} onChange={() => toggle(s.name)}
                      className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-text">{s.name}</span>
                      <span className="text-xs text-text-tertiary ml-2">({s.desc})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {services.filter(s => s.env && selected.includes(s.name)).map(s => (
              <div key={s.name} className="bg-surface rounded-lg p-2 border border-border/50 space-y-1">
                <div className="text-[10px] text-text-tertiary">{s.name} env</div>
                {Object.keys(s.env).map(k => (
                  <input key={k} value={(envOverrides[s.name] || s.env)[k]}
                    onChange={(e) => setEnvOverrides(prev => ({ ...prev, [s.name]: { ...(prev[s.name] || s.env), [k]: e.target.value } }))}
                    className="w-full bg-surface rounded px-2 py-1 text-[11px] font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                ))}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">docker-compose.yml</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[200px]">{output || <span className="text-text-tertiary">Select services to generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
