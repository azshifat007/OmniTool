'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function levenshteinDist(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return { distance: dp[m][n], matrix: dp, maxLen: Math.max(m, n) };
}

export default function LevenshteinPage() {
  const { addEntry } = useHistory();
  const [str1, setStr1] = useState('');
  const [str2, setStr2] = useState('');
  const [result, setResult] = useState(null);

  const handleCompare = useCallback(() => {
    if (!str1 || !str2) return;
    const { distance, maxLen } = levenshteinDist(str1, str2);
    const similarity = maxLen > 0 ? ((1 - distance / maxLen) * 100).toFixed(1) : 100;
    setResult({ distance, similarity });
    addEntry('Levenshtein Distance');
  }, [str1, str2, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">Δ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Levenshtein Distance</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">String A</label>
              <textarea value={str1} onChange={e => setStr1(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Enter first string..." />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">String B</label>
              <textarea value={str2} onChange={e => setStr2(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Enter second string..." />
            </div>
          </div>
          <button onClick={handleCompare} disabled={!str1 || !str2}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
            Calculate Distance
          </button>
        </div>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className="text-3xl font-bold font-heading text-primary">{result.distance}</div>
                  <div className="text-xs text-text-tertiary mt-1">Edit Distance</div>
                </div>
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className="text-3xl font-bold font-heading text-cat-success">{result.similarity}%</div>
                  <div className="text-xs text-text-tertiary mt-1">Similarity</div>
                </div>
              </div>
              {result.distance > 0 && (
                <div className="mt-4 flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                  <span className="text-sm font-mono text-text-secondary">
                    {str1.length} chars → {str2.length} chars
                  </span>
                  <CopyButton text={`Levenshtein Distance: ${result.distance}\nSimilarity: ${result.similarity}%`} />
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
