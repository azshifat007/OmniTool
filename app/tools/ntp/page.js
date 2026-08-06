'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function NtpPage() {
  const { addEntry } = useHistory();
  const [localTime, setLocalTime] = useState('');
  const [ntpTime, setNtpTime] = useState('');
  const [offset, setOffset] = useState(null);
  const [status, setStatus] = useState('');

  const fetchNtp = useCallback(async () => {
    setStatus('Fetching time...');
    const localStart = Date.now();
    try {
      const res = await fetch('https://worldtimeapi.org/api/ip', { cache: 'no-store' });
      const data = await res.json();
      const localEnd = Date.now();
      const rtt = localEnd - localStart;
      const serverTime = new Date(data.utc_datetime).getTime();
      const adjusted = serverTime + Math.round(rtt / 2);
      const offsetMs = adjusted - localStart;
      setNtpTime(new Date(adjusted).toLocaleString());
      setLocalTime(new Date(localStart).toLocaleString());
      setOffset(offsetMs);
      setStatus('Time synced');
      addEntry('NTP Clock');
    } catch {
      setStatus('Could not reach time server.');
    }
  }, [addEntry]);

  useEffect(() => { fetchNtp(); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">NTP Clock</h1>
      </div>
      <GlassCard>
        <div className="p-4 text-center space-y-4 max-w-md mx-auto">
          <p className="text-sm text-text-secondary">Syncs with worldtimeapi.org to show precise network time.</p>
          <button onClick={fetchNtp} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Refresh</button>
          {status && <div className="text-xs text-text-tertiary">{status}</div>}
          {ntpTime && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Network Time</div>
                <div className="text-lg font-bold font-mono text-text">{ntpTime}</div>
              </div>
              <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Local Time</div>
                <div className="text-lg font-bold font-mono text-text">{localTime}</div>
              </div>
              {offset !== null && (
                <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Offset</div>
                  <div className={`text-lg font-bold font-mono ${Math.abs(offset) < 500 ? 'text-cat-success' : 'text-cat-media'}`}>
                    {offset > 0 ? '+' : ''}{offset} ms
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
