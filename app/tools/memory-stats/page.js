'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

export default function MemoryStatsPage() {
  const { addEntry } = useHistory();
  const [stats, setStats] = useState(null);

  const refresh = useCallback(() => {
    addEntry('Memory Stats');
    const m = performance.memory;
    const dm = navigator.deviceMemory;
    setStats({
      jsHeapSizeLimit: m ? m.jsHeapSizeLimit : null,
      totalJSHeapSize: m ? m.totalJSHeapSize : null,
      usedJSHeapSize: m ? m.usedJSHeapSize : null,
      deviceMemory: dm || null,
      supportsPerformanceMemory: !!m,
      supportsDeviceMemory: !!dm,
    });
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">💾</span>
        <h1 className="font-heading text-2xl font-bold text-text">Memory Stats</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">View browser memory usage statistics from the Performance API.</p>
          <div className="flex justify-center">
            <button onClick={refresh} className="px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Refresh Stats</button>
          </div>
          {stats && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {stats.supportsPerformanceMemory ? (
                <>
                  <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="text-text-tertiary">JS Heap Size Limit</span>
                    <span className="font-mono text-text">{formatBytes(stats.jsHeapSizeLimit)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="text-text-tertiary">Total JS Heap Size</span>
                    <span className="font-mono text-text">{formatBytes(stats.totalJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="text-text-tertiary">Used JS Heap Size</span>
                    <span className="font-mono text-text">{formatBytes(stats.usedJSHeapSize)}</span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-cat-warning bg-cat-warning/10 rounded-lg px-3 py-2 border border-cat-warning/20">performance.memory not available in this browser (Chrome/Edge only).</div>
              )}
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Device Memory (navigator)</span>
                <span className="font-mono text-text">{stats.deviceMemory ? stats.deviceMemory + ' GB' : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Device Memory API</span>
                <span className="font-mono text-text">{stats.supportsDeviceMemory ? 'Available' : 'N/A'}</span>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
