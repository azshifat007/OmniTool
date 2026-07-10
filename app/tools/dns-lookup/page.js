'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA'];

export default function DnsLookupPage() {
  const { addEntry } = useHistory();
  const [domain, setDomain] = useState('example.com');
  const [type, setType] = useState('A');
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async () => {
    setError('');
    setRecords(null);
    const d = domain.trim();
    if (!d) { setError('Enter a domain name.'); return; }
    setLoading(true);
    addEntry('DNS Lookup');
    try {
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${type}`;
      const res = await fetch(url, { headers: { Accept: 'application/dns-json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.Status === 3) { setError('Domain not found (NXDOMAIN).'); setRecords(null); return; }
      setRecords(data);
    } catch (e) {
      setError('Lookup failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [domain, type, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">DNS Lookup</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Domain</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Record Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${type === t ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary'}`}>{t}</button>
                ))}
              </div>
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
            <span className="text-xs text-text-tertiary mb-3 block">Records</span>
            {!records ? (
              <div className="text-text-tertiary text-sm">Enter a domain and click Lookup.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-xs">
                  <span className="text-text-tertiary">Status</span>
                  <span className="text-text">{records.Status === 0 ? 'OK' : 'Error'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-xs">
                  <span className="text-text-tertiary">TC (Truncated)</span>
                  <span className="text-text">{records.TC ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-xs">
                  <span className="text-text-tertiary">RD (Recursion Desired)</span>
                  <span className="text-text">{records.RD ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-xs">
                  <span className="text-text-tertiary">RA (Recursion Available)</span>
                  <span className="text-text">{records.RA ? 'Yes' : 'No'}</span>
                </div>
                {records.Answer && records.Answer.map((r, i) => (
                  <div key={i} className="py-2 px-3 rounded-lg bg-surface border border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cat-network bg-cat-network/10 px-1.5 py-0.5 rounded">{r.type}</span>
                      <span className="text-xs text-text-tertiary">{r.name}</span>
                    </div>
                    <div className="text-sm font-mono text-text mt-1 break-all">{r.data}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-text-tertiary">TTL: {r.TTL}s</span>
                      <CopyButton text={r.data} className="text-[10px]" />
                    </div>
                  </div>
                ))}
                {(!records.Answer || records.Answer.length === 0) && (
                  <div className="text-text-tertiary text-sm">No records found for this query.</div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
