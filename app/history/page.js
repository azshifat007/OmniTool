'use client';

import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function HistoryPage() {
  const { history, clear } = useHistory();

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-cat-system">↻</span>
          <h1 className="font-heading text-2xl font-bold text-text">History Panel</h1>
        </div>
        {history.length > 0 && (
          <button
            onClick={clear}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cat-text/10 text-cat-text border border-cat-text/20 hover:bg-cat-text/20 transition-all cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      <GlassCard>
        <div className="p-4">
          {history.length === 0 ? (
            <div className="text-text-secondary text-sm text-center py-12">
              <div className="text-3xl mb-3 opacity-30">↻</div>
              <p>No operations recorded yet</p>
              <p className="text-xs mt-1">Your last 20 tool operations will appear here</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence initial={false}>
                {history.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-badge-bg transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-text flex-1">{entry.name}</span>
                    <span className="text-xs text-text-secondary whitespace-nowrap">{formatTime(entry.timestamp)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
