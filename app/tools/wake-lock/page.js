'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function WakeLockPage() {
  const { addEntry } = useHistory();
  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  let lockRef = null;

  useEffect(() => {
    if (!navigator.wakeLock) setSupported(false);
  }, []);

  const toggle = useCallback(async () => {
    addEntry('Wake Lock');
    if (active) {
      if (lockRef) { lockRef.release(); lockRef = null; }
      setActive(false);
      return;
    }
    try {
      lockRef = await navigator.wakeLock.request('screen');
      setActive(true);
      setError('');
      lockRef.addEventListener('release', () => { setActive(false); lockRef = null; });
    } catch (e) {
      setError(e.message);
    }
  }, [active, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">☀</span>
        <h1 className="font-heading text-2xl font-bold text-text">Wake Lock</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          {!supported ? (
            <div className="text-cat-text text-sm bg-cat-text/10 rounded-lg px-4 py-3 border border-cat-text/20">Wake Lock API not supported in this browser.</div>
          ) : (
            <>
              <p className="text-sm text-text-secondary">Keep your screen awake while you work, read, or present.</p>
              <button onClick={toggle}
                className={`px-8 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${active ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                {active ? '✓ Active — Click to Release' : 'Activate Wake Lock'}
              </button>
              {active && <div className="text-xs text-green-500">Screen will not sleep or dim.</div>}
              {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
