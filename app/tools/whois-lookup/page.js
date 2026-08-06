'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function WhoisLookupPage() {
  const { addEntry } = useHistory();
  const [domain, setDomain] = useState('example.com');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async () => {
    setError('');
    setData(null);
    const d = domain.trim().toLowerCase();
    if (!d) { setError('Enter a domain.'); return; }
    setLoading(true);
    addEntry('Whois Lookup');
    try {
      const res = await fetch(`https://rdap.org/domain/${d}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Domain not found in RDAP registry.');
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('Lookup failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [domain, addEntry]);

  const getVal = (arr, key) => {
    if (!arr) return '';
    const found = arr.find(v => v?.vcardArray?.[1]?.some?.(r => r?.[1]?.toLowerCase()?.includes(key?.toLowerCase())));
    if (!found) return '';
    const props = found.vcardArray[1].find(r => r[1]?.toLowerCase()?.includes(key?.toLowerCase()));
    return props ? props[3] || props[2] || '' : '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Whois Lookup</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <p className="text-sm text-text-secondary">Query domain registration information using the RDAP protocol.</p>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Domain</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
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
            <span className="text-xs text-text-tertiary mb-3 block">Registration Info</span>
            {!data ? (
              <div className="text-text-tertiary text-sm">Enter a domain and click Lookup.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto text-sm">
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary text-xs">Domain</span>
                  <span className="font-mono text-text text-xs">{data.ldhName || '?'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary text-xs">Handle</span>
                  <span className="font-mono text-text text-xs">{data.handle || '?'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary text-xs">Registry</span>
                  <span className="font-mono text-text text-xs">{data.port43 || 'RDAP'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                  <span className="text-text-tertiary text-xs">Events</span>
                  <span className="font-mono text-text text-xs">{(data.events?.length || 0)} recorded</span>
                </div>
                {data.events?.slice(0, 4).map((ev, i) => (
                  <div key={i} className="flex justify-between py-1 px-3 rounded-lg bg-surface border border-border/50">
                    <span className="text-text-tertiary text-[10px]">{ev.eventAction}</span>
                    <span className="font-mono text-text text-[10px]">{ev.eventDate?.split('T')[0]}</span>
                  </div>
                ))}
                {data.entities?.map((ent, i) => (
                  <div key={i} className="pt-1">
                    <div className="text-[10px] text-text-tertiary mb-1">{ent.roles?.join(', ') || 'Entity'}</div>
                    {ent.vcardArray?.[1]?.slice(0, 4).map((prop, j) => (
                      <div key={j} className="flex justify-between py-1 px-3 rounded-lg bg-surface border border-border/50 text-[10px]">
                        <span className="text-text-tertiary">{prop[0]}</span>
                        <span className="font-mono text-text">{String(prop[3] || prop[2] || '')}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {data.entities?.length > 0 && (
                  <div className="pt-1"><CopyButton text={JSON.stringify(data.entities, null, 2)} className="text-[10px]" /></div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
