'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function UuidPage() {
  const { addEntry } = useHistory();
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState('v4');
  const [uuids, setUuids] = useState([]);
  const [error, setError] = useState('');

  const generate = useCallback(() => {
    setError('');
    try {
      const n = Math.min(Math.max(count, 1), 100);
      const result = [];
      for (let i = 0; i < n; i++) {
        result.push(crypto.randomUUID());
      }
      setUuids(result);
      addEntry('UUID Generator');
    } catch (e) {
      setError(e.message);
    }
  }, [count, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⦿</span>
        <h1 className="font-heading text-2xl font-bold text-text">UUID Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Version:</span>
            {['v4', 'v7'].map((v) => (
              <button key={v} onClick={() => setVersion(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  version === v ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}
              >{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Count:</span>
            <input type="number" min={1} max={100} value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-16 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
          </div>
          <button onClick={generate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer ml-auto">Generate</button>
        </div>
      </GlassCard>

      {uuids.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated UUIDs ({uuids.length})</span>
              <CopyButton text={uuids.join('\n')} />
            </div>
            <div className="space-y-1">
              {uuids.map((uuid, i) => (
                <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text flex items-center gap-3 border border-border/50">
                  <span className="text-text-tertiary text-xs">#{i + 1}</span>
                  <span className="flex-1">{uuid}</span>
                  <button onClick={() => navigator.clipboard.writeText(uuid)}
                    className="text-text-tertiary hover:text-text transition-colors text-xs cursor-pointer">Copy</button>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
