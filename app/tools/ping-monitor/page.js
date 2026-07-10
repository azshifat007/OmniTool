'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const DEFAULT_HOSTS = [
  { label: 'Google', url: 'https://www.google.com' },
  { label: 'Cloudflare', url: 'https://www.cloudflare.com' },
  { label: 'GitHub', url: 'https://github.com' },
];

export default function PingMonitorPage() {
  const { addEntry } = useHistory();
  const [hosts, setHosts] = useState(DEFAULT_HOSTS);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const ping = useCallback(async (url) => {
    const start = performance.now();
    try {
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(8000) });
      const ms = Math.round(performance.now() - start);
      return { status: res.status || 'alive', ms };
    } catch {
      const ms = Math.round(performance.now() - start);
      return { status: 'timeout', ms };
    }
  }, []);

  const runAll = useCallback(async () => {
    addEntry('Ping Monitor');
    setRunning(true);
    const res = [];
    for (const host of hosts) {
      const r = await ping(host.url);
      res.push({ label: host.label, url: host.url, ...r });
    }
    setResults(res);
    setRunning(false);
  }, [hosts, ping, addEntry]);

  const addCustom = useCallback(() => {
    if (!customLabel.trim() || !customUrl.trim()) return;
    setHosts(h => [...h, { label: customLabel.trim(), url: customUrl.trim() }]);
    setCustomLabel('');
    setCustomUrl('');
    addEntry('Ping Monitor');
  }, [customLabel, customUrl, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">📡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Ping Monitor</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Hosts</span>
            <div className="space-y-1">
              {hosts.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <span className="font-medium text-text flex-1">{h.label}</span>
                  <span className="text-text-tertiary truncate max-w-40">{h.url}</span>
                  <button onClick={() => setHosts(hosts.filter((_, j) => j !== i))} className="text-cat-text text-[10px] hover:bg-cat-text/10 px-1 rounded cursor-pointer">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Label"
                className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://..."
                className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <button onClick={addCustom} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Add</button>
            </div>
            <button onClick={runAll} disabled={running}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">
              {running ? 'Pinging...' : 'Ping All Hosts'}
            </button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary block mb-3">Results</span>
            {results.length === 0 ? (
              <div className="text-text-tertiary text-sm text-center py-8">Click Ping to measure response times.</div>
            ) : (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 border border-border/50">
                    <div className={`w-2 h-2 rounded-full ${r.status === 'timeout' ? 'bg-cat-text' : 'bg-green-500'}`} />
                    <span className="text-xs font-medium text-text w-20">{r.label}</span>
                    <span className="text-xs text-text-tertiary flex-1">{r.ms}ms</span>
                    <span className={`text-[10px] ${r.status === 'timeout' ? 'text-cat-text' : 'text-green-500'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
