'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function UrlHealthPage() {
  const { addEntry } = useHistory();
  const [url, setUrl] = useState('https://example.com');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setError('');
    setResult(null);
    const u = url.trim();
    if (!u) { setError('Enter a URL.'); return; }
    setLoading(true);
    addEntry('URL Health Check');
    const start = performance.now();
    try {
      const res = await fetch(u, { method: 'HEAD', mode: 'cors' });
      const elapsed = Math.round(performance.now() - start);
      const headers = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      setResult({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        timing: elapsed,
        headers,
        redirected: res.redirected,
        url: res.url,
      });
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      setError(`Request failed after ${elapsed}ms: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [url, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">URL Health Check</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <p className="text-sm text-text-secondary">Check if a URL is reachable and inspect response headers and timing.</p>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button onClick={check} disabled={loading}
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              {loading ? 'Checking...' : 'Check'}
            </button>
            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Response</span>
            {!result ? (
              <div className="text-text-tertiary text-sm">Click Check to fetch the URL.</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 ${result.ok ? 'border-cat-success/30' : 'border-cat-text/30'}`}>
                  <span className="text-text-tertiary">Status</span>
                  <span className={`font-mono font-medium ${result.ok ? 'text-cat-success' : 'text-cat-text'}`}>{result.status} {result.statusText}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Response Time</span>
                  <span className="font-mono text-text">{result.timing} ms</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary">Redirected</span>
                  <span className="font-mono text-text">{result.redirected ? 'Yes → ' + result.url : 'No'}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-tertiary">Response Headers</span>
                    <CopyButton text={JSON.stringify(result.headers, null, 2)} className="text-[10px]" />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {Object.entries(result.headers).slice(0, 15).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 px-3 rounded-lg bg-surface border border-border/50 text-[10px]">
                        <span className="text-text-tertiary">{k}</span>
                        <span className="font-mono text-text ml-2 text-right">{String(v).slice(0, 60)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
