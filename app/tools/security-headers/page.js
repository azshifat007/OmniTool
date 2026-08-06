'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const importantHeaders = [
  'Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options',
  'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy',
  'X-XSS-Protection', 'Access-Control-Allow-Origin', 'Cache-Control',
  'Cross-Origin-Embedder-Policy', 'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
];

function gradeHeaders(headers) {
  let score = 0; const total = importantHeaders.length;
  const details = importantHeaders.map(h => {
    const val = headers[h.toLowerCase()] || headers[h] || '';
    const present = !!val;
    if (present) score++;
    return { header: h, present, value: val };
  });
  return { score, total, details };
}

function severityLabel(score, total) {
  const pct = score / total;
  if (pct >= 0.8) return { label: 'Excellent', color: 'text-cat-success' };
  if (pct >= 0.5) return { label: 'Good', color: 'text-cat-date' };
  if (pct >= 0.3) return { label: 'Fair', color: 'text-cat-media' };
  return { label: 'Poor', color: 'text-cat-text' };
}

export default function SecurityHeadersPage() {
  const { addEntry } = useHistory();
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const check = useCallback(async () => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setResult(null);
    addEntry('Security Headers Check');
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const headers = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      const hostname = new URL(url).hostname;
      const analysis = gradeHeaders(headers);
      setResult({ hostname, headers, analysis });
    } catch {
      try {
        const url2 = domain.startsWith('http') ? domain : `https://${domain}`;
        const res2 = await fetch(url2, { method: 'GET', mode: 'no-cors' });
        const headers = {};
        res2.headers.forEach((v, k) => { headers[k] = v; });
        const analysis = gradeHeaders(headers);
        setResult({ hostname: new URL(url2).hostname, headers, analysis });
      } catch {
        setError('Could not reach the domain. Check the URL and try again.');
      }
    }
    setLoading(false);
  }, [domain, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">Security Headers Check</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Domain</label>
          <div className="flex gap-3">
            <input value={domain} onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="example.com"
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={check} disabled={!domain.trim() || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
          {error && <p className="text-xs text-cat-text mt-2">{error}</p>}
        </div>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-tertiary">{result.hostname}</span>
                <span className={`text-sm font-bold font-heading ${severityLabel(result.analysis.score, result.analysis.total).color}`}>
                  {severityLabel(result.analysis.score, result.analysis.total).label} ({result.analysis.score}/{result.analysis.total})
                </span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 mb-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(result.analysis.score / result.analysis.total) * 100}%` }} />
              </div>
              <div className="space-y-2">
                {result.analysis.details.map(({ header, present, value }) => (
                  <div key={header} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${present ? 'bg-cat-success' : 'bg-cat-text'}`} />
                      <span className="text-xs font-mono text-text truncate">{header}</span>
                    </div>
                    <span className="text-xs text-text-tertiary ml-2 flex-shrink-0 truncate max-w-[200px]" title={value}>
                      {present ? value || 'Present' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
