'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function GeoLocationPage() {
  const { addEntry } = useHistory();
  const [pos, setPos] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    setError('');
    setPos(null);
    if (!navigator.geolocation) { setError('Geolocation is not supported in this browser.'); return; }
    setLoading(true);
    addEntry('Geolocation');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          acc: p.coords.accuracy,
          alt: p.coords.altitude,
          altAcc: p.coords.altitudeAccuracy,
          heading: p.coords.heading,
          speed: p.coords.speed,
          time: new Date(p.timestamp).toLocaleString(),
        });
        setLoading(false);
      },
      (e) => {
        const msgs = { 1: 'Permission denied.', 2: 'Position unavailable.', 3: 'Timed out.' };
        setError(msgs[e.code] || e.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [addEntry]);

  const openMaps = useCallback(() => {
    if (!pos) return;
    window.open(`https://www.google.com/maps?q=${pos.lat},${pos.lng}`, '_blank');
  }, [pos]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">🌍</span>
        <h1 className="font-heading text-2xl font-bold text-text">Geolocation</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Your browser will ask for permission to access your location.</p>
          <div className="flex justify-center gap-3">
            <button onClick={locate} disabled={loading}
              className="px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              {loading ? 'Locating...' : 'Get Location'}
            </button>
          </div>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {pos && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Latitude</span><span className="font-mono text-text">{pos.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Longitude</span><span className="font-mono text-text">{pos.lng.toFixed(6)}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Accuracy</span><span className="font-mono text-text">{pos.acc.toFixed(0)} m</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Altitude</span><span className="font-mono text-text">{pos.alt !== null ? pos.alt.toFixed(1) + ' m' : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Altitude Accuracy</span><span className="font-mono text-text">{pos.altAcc !== null ? pos.altAcc.toFixed(0) + ' m' : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Heading</span><span className="font-mono text-text">{pos.heading !== null ? pos.heading.toFixed(0) + '°' : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Speed</span><span className="font-mono text-text">{pos.speed !== null ? pos.speed.toFixed(1) + ' m/s' : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Timestamp</span><span className="font-mono text-text text-xs">{pos.time}</span>
              </div>
              <div className="flex justify-center pt-2">
                <button onClick={openMaps} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text border border-border hover:border-primary transition-all cursor-pointer">Open in Google Maps</button>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
