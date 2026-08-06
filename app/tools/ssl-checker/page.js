'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function SslCheckerPage() {
  const { addEntry } = useHistory();
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = useCallback(async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    addEntry('SSL Certificate Checker');
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const start = performance.now();
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setResult({
        url: new URL(url).hostname,
        reachable: true,
        time: elapsed,
        status: res.status || 'unknown (no-cors)',
      });
    } catch {
      setResult({ url: domain, reachable: false, time: null, status: null });
    }
    setLoading(false);
  }, [domain, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">SSL Certificate Checker</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Domain</label>
          <div className="flex gap-3">
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              placeholder="example.com"
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={handleCheck} disabled={!domain.trim() || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>
      </GlassCard>

      {error && (
        <GlassCard className="mt-4">
          <div className="p-3 text-sm text-cat-text">{error}</div>
        </GlassCard>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className={`text-lg font-bold font-heading ${result.reachable ? 'text-cat-success' : 'text-cat-text'}`}>
                    {result.reachable ? 'Reachable' : 'Unreachable'}
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">Status</div>
                </div>
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{result.time ? `${result.time}s` : '—'}</div>
                  <div className="text-xs text-text-tertiary mt-1">Response Time</div>
                </div>
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{result.status ?? '—'}</div>
                  <div className="text-xs text-text-tertiary mt-1">HTTP Status</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-text-tertiary text-center">
                Checked: <span className="font-mono text-text">{result.url}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
