'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const STORAGE_KEY = 'omnitool_passwords';

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function encode(text) {
  return btoa(text.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join(''));
}

function decode(text) {
  try { return atob(text).split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join(''); } catch { return ''; }
}

export default function PasswordManagerPage() {
  const { addEntry } = useHistory();
  const [entries, setEntries] = useState([]);
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState({});
  const [masterKey, setMasterKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => { if (entries.length > 0) save(); }, [entries, save]);

  const add = useCallback(() => {
    if (!site.trim() || !username.trim() || !password.trim()) return;
    addEntry('Password Manager');
    const encoded = encode(password);
    setEntries(prev => {
      const next = [...prev, { id: Date.now(), site: site.trim(), username: username.trim(), password: encoded, created: new Date().toLocaleDateString() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setSite(''); setUsername(''); setPassword('');
  }, [site, username, password, addEntry]);

  const remove = useCallback((id) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleReveal = useCallback((id) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const unlock = useCallback(() => {
    if (masterKey === 'omnitool') setUnlocked(true);
  }, [masterKey]);

  const filtered = entries.filter(e =>
    !search.trim() ||
    e.site.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!unlocked) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-cat-security">🔑</span>
          <h1 className="font-heading text-2xl font-bold text-text">Password Manager</h1>
        </div>
        <GlassCard>
          <div className="p-4 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-sm text-text-secondary">Enter master password to unlock vault</p>
              <p className="text-xs text-text-tertiary mt-1">Default: omnitool</p>
            </div>
            <input type="password" value={masterKey} onChange={e => setMasterKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              placeholder="Master password"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors mb-3" />
            <button onClick={unlock}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Unlock</button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">🔑</span>
        <h1 className="font-heading text-2xl font-bold text-text">Password Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Add New Entry</span>
            <input value={site} onChange={e => setSite(e.target.value)} placeholder="Site (e.g. github.com)"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username / Email"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              type="text"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={add} disabled={!site || !username || !password}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">Save</button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <div className="text-xs text-text-tertiary">{filtered.length} entry{filtered.length !== 1 ? 'ies' : 'y'}</div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {filtered.map(e => (
                <div key={e.id} className="bg-surface rounded-lg border border-border/50 p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text truncate">{e.site}</div>
                      <div className="text-xs text-text-tertiary mt-0.5">{e.username}</div>
                      <div className="text-xs font-mono mt-1">
                        {revealed[e.id] ? decode(e.password) : '••••••••'}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => toggleReveal(e.id)}
                        className="px-2 py-1 text-xs rounded bg-surface border border-border text-text-tertiary hover:text-text transition-all cursor-pointer">
                        {revealed[e.id] ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => remove(e.id)}
                        className="px-2 py-1 text-xs rounded bg-surface border border-border text-cat-text hover:bg-cat-text/10 transition-all cursor-pointer">
                        Del
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary mt-1.5">Added: {e.created}</div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-4">No entries found</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      <p className="text-xs text-text-tertiary mt-4 text-center">Passwords are stored locally in your browser. Clear browser data to remove all entries.</p>
    </motion.div>
  );
}
