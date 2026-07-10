'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function estimateSpeed(bytes, ms) {
  if (ms <= 0) return 0;
  const bits = bytes * 8;
  const sec = ms / 1000;
  return Math.round(bits / sec / 1e6 * 100) / 100;
}

export default function BandwidthPage() {
  const { addEntry } = useHistory();
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const imgRef = useRef(null);

  const run = useCallback(() => {
    setStatus('testing');
    setResult(null);
    addEntry('Bandwidth Test');
    const start = performance.now();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = 'https://www.google.com/images/phd/px.gif?t=' + Date.now();
    img.onload = () => {
      const elapsed = performance.now() - start;
      const size = 900;
      const mbps = estimateSpeed(size, elapsed);
      setResult({ mbps, latency: Math.round(elapsed), size });
      setStatus('done');
    };
    img.onerror = () => {
      setStatus('error');
    };
    img.src = url;
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">∼</span>
        <h1 className="font-heading text-2xl font-bold text-text">Bandwidth Test</h1>
      </div>
      <GlassCard>
        <div className="p-4 text-center space-y-4">
          <p className="text-sm text-text-secondary">Estimates your connection speed by downloading a small test resource.</p>
          <button onClick={run} disabled={status === 'testing'}
            className="px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
            {status === 'idle' ? 'Start Test' : status === 'testing' ? 'Testing...' : 'Test Again'}
          </button>
          {status === 'testing' && (
            <div className="flex items-center justify-center gap-2 text-text-tertiary text-sm">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>Downloading</motion.span>
              <span className="flex gap-0.5">{...[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }} className="w-1 h-1 rounded-full bg-text-tertiary" />)}</span>
            </div>
          )}
          {status === 'error' && <div className="text-cat-text text-xs">Test failed. Check your connection.</div>}
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 pt-2">
              <div className="text-4xl font-bold font-heading text-text">{result.mbps < 0.1 ? '< 0.1' : result.mbps} <span className="text-lg text-text-secondary font-normal">Mbps</span></div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
                  <div className="text-xs text-text-tertiary">Latency</div>
                  <div className="text-sm font-semibold text-text">{result.latency} ms</div>
                </div>
                <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
                  <div className="text-xs text-text-tertiary">Size</div>
                  <div className="text-sm font-semibold text-text">{result.size} B</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
