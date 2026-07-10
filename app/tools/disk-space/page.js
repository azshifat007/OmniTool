'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function DiskSpacePage() {
  const { addEntry } = useHistory();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    addEntry('Disk Space Checker');
    if (!navigator.storage || !navigator.storage.estimate) {
      setInfo({ available: 'API not supported', used: 'N/A', quota: 'N/A', usage: 0 });
      return;
    }
    navigator.storage.estimate().then(est => {
      const { quota, usage } = est;
      setInfo({
        available: (quota - usage) / 1048576,
        used: usage / 1048576,
        quota: quota / 1048576,
        usage,
        quotaBytes: quota,
        pct: (usage / quota) * 100,
      });
    });
  }, [addEntry]);

  const fmt = (mb) => {
    if (typeof mb !== 'number') return mb;
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  if (!info) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">💾</span>
        <h1 className="font-heading text-2xl font-bold text-text">Disk Space Checker</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          {info.available === 'API not supported' ? (
            <div className="text-sm text-cat-text">Storage Manager API is not supported in this browser.</div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary)" strokeWidth="10"
                      strokeDasharray={`${info.pct * 3.14} ${(100 - info.pct) * 3.14}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <div className="text-2xl font-bold font-heading text-text">{info.pct.toFixed(0)}%</div>
                      <div className="text-xs text-text-tertiary">Used</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-sm font-bold text-text">{fmt(info.used)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Used</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-sm font-bold text-text">{fmt(info.available)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Available</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-sm font-bold text-text">{fmt(info.quota)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Total Quota</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
