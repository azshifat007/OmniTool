'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function getStorage(type) {
  try { return type === 'local' ? localStorage : sessionStorage; } catch { return null; }
}

function getEntries(type) {
  const s = getStorage(type);
  if (!s) return [];
  const keys = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    try { keys.push({ key: k, value: s.getItem(k), size: new Blob([k + s.getItem(k)]).size }); } catch {}
  }
  return keys;
}

export default function StoragePage() {
  const { addEntry } = useHistory();
  const [type, setType] = useState('local');
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [totalSize, setTotalSize] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    const e = getEntries(type);
    setEntries(e);
    setTotalSize(e.reduce((s, x) => s + x.size, 0));
  }, [type]);

  useEffect(() => { refresh(); addEntry('Storage Explorer'); }, [refresh, refreshKey, addEntry]);

  const filtered = entries.filter((e) => e.key.toLowerCase().includes(search.toLowerCase()));

  const addItem = () => {
    if (!newKey.trim()) return;
    const s = getStorage(type);
    s.setItem(newKey, newValue);
    setNewKey('');
    setNewValue('');
    setRefreshKey((k) => k + 1);
  };

  const updateItem = () => {
    if (editKey && editValue !== null) {
      const s = getStorage(type);
      s.setItem(editKey, editValue);
      setEditKey(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const deleteItem = (key) => {
    const s = getStorage(type);
    s.removeItem(key);
    setRefreshKey((k) => k + 1);
  };

  const clearAll = () => {
    if (entries.length === 0) return;
    if (!confirm('Clear all entries?')) return;
    const s = getStorage(type);
    s.clear();
    setRefreshKey((k) => k + 1);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">◫</span>
        <h1 className="font-heading text-2xl font-bold text-text">Storage Explorer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['local', 'session'].map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                        type === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                      }`}>{t === 'local' ? 'localStorage' : 'sessionStorage'}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-secondary">{entries.length} keys · {(totalSize / 1024).toFixed(1)}KB</span>
                  <button onClick={clearAll} className="text-[10px] text-cat-text hover:underline cursor-pointer">Clear</button>
                </div>
              </div>

              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search keys..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />

              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filtered.length === 0 && <div className="text-xs text-text-tertiary text-center py-4">No entries</div>}
                {filtered.map((e) => (
                  <div key={e.key} className="bg-surface rounded-lg border border-border overflow-hidden">
                    {editKey === e.key ? (
                      <div className="p-2 space-y-2">
                        <div className="text-[10px] font-mono text-text-tertiary">{e.key}</div>
                        <textarea value={editValue} onChange={(e2) => setEditValue(e2.target.value)} rows={2}
                          className="w-full bg-badge-bg rounded px-2 py-1 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                        <div className="flex gap-2">
                          <button onClick={updateItem} className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 cursor-pointer">Save</button>
                          <button onClick={() => setEditKey(null)} className="text-[10px] px-2 py-1 rounded bg-surface text-text-secondary border border-border cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between p-2 gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono text-text break-all">{e.key}</div>
                          <div className="text-[10px] font-mono text-text-secondary break-all truncate">{e.value}</div>
                          <div className="text-[9px] text-text-tertiary">{e.size}B</div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setEditKey(e.key); setEditValue(e.value); }} className="text-[10px] text-primary hover:underline cursor-pointer">Edit</button>
                          <button onClick={() => deleteItem(e.key)} className="text-[10px] text-cat-text hover:underline cursor-pointer">Del</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Add Entry</span>
              <div className="space-y-2">
                <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <textarea value={newValue} onChange={(e) => setNewValue(e.target.value)} rows={4} placeholder="Value"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={addItem} className="w-full rounded-xl px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Add</button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
