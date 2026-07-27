'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function diffJson(a, b, path = '') {
  const changes = [];
  if (a === b) return changes;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    changes.push({ path: path || 'root', type: a === undefined ? 'added' : b === undefined ? 'removed' : 'changed', oldVal: a, newVal: b });
    return changes;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= a.length) changes.push({ path: `${path}[${i}]`, type: 'added', newVal: b[i] });
      else if (i >= b.length) changes.push({ path: `${path}[${i}]`, type: 'removed', oldVal: a[i] });
      else changes.push(...diffJson(a[i], b[i], `${path}[${i}]`));
    }
    return changes;
  }
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    if (!(key in b)) changes.push({ path: path ? `${path}.${key}` : key, type: 'removed', oldVal: a[key] });
    else if (!(key in a)) changes.push({ path: path ? `${path}.${key}` : key, type: 'added', newVal: b[key] });
    else changes.push(...diffJson(a[key], b[key], path ? `${path}.${key}` : key));
  }
  return changes;
}

export default function JsonDiffPage() {
  const { addEntry } = useHistory();
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [error, setError] = useState('');

  const changes = useMemo(() => {
    if (!left.trim() || !right.trim()) return [];
    try {
      const a = JSON.parse(left);
      const b = JSON.parse(right);
      setError('');
      return diffJson(a, b);
    } catch (e) {
      setError(e.message);
      return [];
    }
  }, [left, right]);

  const summary = useMemo(() => {
    const added = changes.filter(c => c.type === 'added').length;
    const removed = changes.filter(c => c.type === 'removed').length;
    const changed = changes.filter(c => c.type === 'changed').length;
    return { added, removed, changed, total: added + removed + changed };
  }, [changes]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇔</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON Diff</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Original</span>
              {left && <CopyButton text={left} />}
            </div>
            <textarea value={left} onChange={e => setLeft(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste original JSON..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Modified</span>
              {right && <CopyButton text={right} />}
            </div>
            <textarea value={right} onChange={e => setRight(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste modified JSON..." />
          </div>
        </GlassCard>
      </div>

      {summary.total > 0 && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-semibold text-text">Summary</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{summary.added} added</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{summary.removed} removed</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">{summary.changed} changed</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {changes.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs font-mono">
                  <span className={`shrink-0 w-16 text-center py-0.5 rounded font-semibold ${
                    c.type === 'added' ? 'bg-green-100 text-green-700' :
                    c.type === 'removed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{c.type}</span>
                  <span className="text-text-tertiary shrink-0">{c.path}</span>
                  {c.type === 'changed' && (
                    <>
                      <span className="text-red-600 line-through break-all">{JSON.stringify(c.oldVal)}</span>
                      <span className="text-text-tertiary">→</span>
                      <span className="text-green-600 break-all">{JSON.stringify(c.newVal)}</span>
                    </>
                  )}
                  {c.type === 'added' && <span className="text-green-600 break-all">{JSON.stringify(c.newVal)}</span>}
                  {c.type === 'removed' && <span className="text-red-600 line-through break-all">{JSON.stringify(c.oldVal)}</span>}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {summary.total === 0 && left.trim() && right.trim() && !error && (
        <GlassCard className="mt-5">
          <div className="p-4 text-center">
            <span className="text-sm text-green-600 font-medium">JSON objects are identical ✓</span>
          </div>
        </GlassCard>
      )}

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
