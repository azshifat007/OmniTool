'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function IpGeoPage() {
  const { addEntry } = useHistory();
  const [ip, setIp] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async () => {
    setError('');
    setData(null);
    setLoading(true);
    addEntry('IP Geolocation');
    try {
      const q = ip.trim() || '';
      const res = await fetch(`https://ip-api.com/json/${q}?fields=status,message,country,regionName,city,zip,lat,lon,isp,org,as,query,timezone,offset`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status === 'fail') throw new Error(json.message || 'Lookup failed');
      setData(json);
    } catch (e) {
      setError('Lookup failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [ip, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">IP Geolocation</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <p className="text-sm text-text-secondary">Look up the geographic location of an IP address. Leave empty for your own IP.</p>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">IP Address</label>
              <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Leave empty for your IP"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button onClick={lookup} disabled={loading}
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              {loading ? 'Looking up...' : 'Lookup'}
            </button>
            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Location Info</span>
            {!data ? (
              <div className="text-text-tertiary text-sm">Enter an IP and click Lookup.</div>
            ) : (
              <div className="space-y-2 text-sm">
                {[
                  ['IP', data.query],
                  ['Country', data.country],
                  ['Region', data.regionName],
                  ['City', data.city],
                  ['ZIP', data.zip],
                  ['Latitude', data.lat],
                  ['Longitude', data.lon],
                  ['ISP', data.isp],
                  ['Organization', data.org],
                  ['AS', data.as],
                  ['Timezone', data.timezone],
                  ['Offset', data.offset != null ? `UTC${data.offset >= 0 ? '+' : ''}${data.offset / 3600}` : ''],
                ].filter(([, v]) => v != null && v !== '').map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                    <span className="text-text-tertiary text-xs">{label}</span>
                    <span className="font-mono text-text text-xs">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
