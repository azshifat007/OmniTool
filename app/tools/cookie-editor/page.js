'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function CookieEditorPage() {
  const { addEntry } = useHistory();
  const [cookies, setCookies] = useState([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [path, setPath] = useState('/');
  const [days, setDays] = useState('7');
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    addEntry('Cookie Editor');
    const raw = document.cookie;
    if (!raw) { setCookies([]); setMessage('No cookies for this site.'); return; }
    const parsed = raw.split(';').map(s => {
      const eq = s.indexOf('=');
      return eq === -1 ? { name: s.trim(), value: '' } : { name: s.slice(0, eq).trim(), value: s.slice(eq + 1).trim() };
    });
    setCookies(parsed);
    setMessage('');
  }, [addEntry]);

  const setCookie = useCallback(() => {
    addEntry('Cookie Editor');
    if (!name.trim()) { setMessage('Enter a cookie name.'); return; }
    const d = new Date();
    d.setDate(d.getDate() + (parseInt(days) || 7));
    document.cookie = `${name.trim()}=${value}; path=${path || '/'}; expires=${d.toUTCString()}`;
    setMessage(`Cookie "${name.trim()}" set!`);
    load();
  }, [name, value, path, days, load, addEntry]);

  const deleteCookie = useCallback((n) => {
    addEntry('Cookie Editor');
    document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    setMessage(`Cookie "${n}" deleted.`);
    load();
  }, [load, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">🍪</span>
        <h1 className="font-heading text-2xl font-bold text-text">Cookie Editor</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Set a New Cookie</span>
            <div>
              <label className="text-[10px] text-text-tertiary">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary">Value</label>
              <input value={value} onChange={(e) => setValue(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-text-tertiary">Path</label>
                <input value={path} onChange={(e) => setPath(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary">Expires (days)</label>
                <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={setCookie} className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Set Cookie</button>
              <button onClick={load} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text border border-border hover:border-primary transition-all cursor-pointer">Refresh</button>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Current Cookies ({cookies.length})</span>
            {cookies.length === 0 ? (
              <div className="text-text-tertiary text-sm">No cookies found. Click Refresh.</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {cookies.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-text truncate">{c.name}</div>
                      <div className="text-[10px] text-text-tertiary truncate">{c.value}</div>
                    </div>
                    <button onClick={() => deleteCookie(c.name)} className="text-cat-text text-[10px] px-1.5 py-0.5 rounded hover:bg-cat-text/10 transition-all cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            )}
            {message && <div className="text-xs text-text-tertiary mt-2">{message}</div>}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
