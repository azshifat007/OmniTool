'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function CookieViewerPage() {
  const { addEntry } = useHistory();
  const [cookies, setCookies] = useState([]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const parseCookies = useCallback(() => {
    addEntry('Cookie Viewer');
    const raw = document.cookie;
    if (!raw) { setCookies([]); return; }
    const parsed = raw.split(';').map(s => {
      const eq = s.indexOf('=');
      if (eq === -1) return { name: s.trim(), value: '' };
      return { name: s.slice(0, eq).trim(), value: s.slice(eq + 1).trim() };
    });
    setCookies(parsed);
  }, [addEntry]);

  const clearAll = useCallback(() => {
    document.cookie.split(';').forEach(c => {
      const eq = c.indexOf('=');
      const name = eq !== -1 ? c.slice(0, eq).trim() : c.trim();
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
    setCookies([]);
  }, []);

  const filtered = search ? cookies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.value.toLowerCase().includes(search.toLowerCase())) : cookies;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">🍪</span>
        <h1 className="font-heading text-2xl font-bold text-text">Cookie Viewer</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <p className="text-sm text-text-secondary">View, search, and clear cookies set by this site in your browser.</p>
            <div className="flex gap-2">
              <button onClick={parseCookies} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Load Cookies</button>
              {cookies.length > 0 && (
                <button onClick={clearAll} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-cat-text/10 text-cat-text hover:bg-cat-text/20 transition-all cursor-pointer">Clear All</button>
              )}
            </div>
            {cookies.length > 0 && (
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Search</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter cookies..."
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Cookies ({filtered.length})</span>
            {filtered.length === 0 ? (
              <div className="text-text-tertiary text-sm">{cookies.length === 0 ? 'Click "Load Cookies" to view cookies for this site.' : 'No matching cookies.'}</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtered.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 px-3 rounded-lg bg-surface border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">{c.name}</div>
                      <div className="text-xs text-text-tertiary truncate">{c.value}</div>
                    </div>
                    <CopyButton text={c.name + '=' + c.value} className="text-xs shrink-0" />
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
