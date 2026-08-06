'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function NetInfoPage() {
  const { addEntry } = useHistory();
  const [info, setInfo] = useState(null);

  const update = useCallback(() => {
    addEntry('Network Info');
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) { setInfo({ unsupported: true }); return; }
    setInfo({
      downlink: conn.downlink,
      downlinkMax: conn.downlinkMax,
      effectiveType: conn.effectiveType,
      rtt: conn.rtt,
      saveData: conn.saveData,
      type: conn.type,
      unsupported: false,
    });
  }, [addEntry]);

  useEffect(() => {
    update();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const handler = () => update();
      conn.addEventListener('change', handler);
      return () => conn.removeEventListener('change', handler);
    }
  }, [update]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Network Info</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Real-time browser network connection information from the Network Information API.</p>
          {info?.unsupported ? (
            <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20 text-center">Network Information API not supported in this browser.</div>
          ) : info ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Connection Type</span>
                <span className="font-mono text-text">{info.type || 'unknown'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Effective Type</span>
                <span className="font-mono text-text">{info.effectiveType || '?'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Downlink</span>
                <span className="font-mono text-text">{info.downlink != null ? info.downlink + ' Mbps' : '?'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Downlink Max</span>
                <span className="font-mono text-text">{info.downlinkMax != null ? info.downlinkMax + ' Mbps' : '?'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">RTT (Round Trip Time)</span>
                <span className="font-mono text-text">{info.rtt != null ? info.rtt + ' ms' : '?'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Save Data Mode</span>
                <span className="font-mono text-text">{info.saveData ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="text-[10px] text-text-tertiary text-center pt-2">Auto-updates when connection changes</div>
            </motion.div>
          ) : (
            <div className="text-text-tertiary text-sm text-center">Reading network information...</div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
