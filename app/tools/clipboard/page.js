'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ClipboardPage() {
  const { addEntry } = useHistory();
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState('');

  const copy = useCallback(async () => {
    if (!current.trim()) return;
    try {
      await navigator.clipboard.writeText(current);
      setItems(i => {
        const next = [current, ...i.filter(x => x !== current)].slice(0, 10);
        localStorage.setItem('omnitool-clipboard', JSON.stringify(next));
        return next;
      });
      setStatus('Copied!');
      addEntry('Clipboard Manager');
    } catch { setStatus('Copy failed.'); }
    setTimeout(() => setStatus(''), 1500);
  }, [current, addEntry]);

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCurrent(text);
      setStatus('Pasted from clipboard');
    } catch { setStatus('Paste failed.'); }
    setTimeout(() => setStatus(''), 1500);
  }, []);

  const restore = useCallback((text) => {
    setCurrent(text);
    addEntry('Clipboard Manager');
  }, [addEntry]);

  const copyItem = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied!');
    } catch { setStatus('Copy failed.'); }
    setTimeout(() => setStatus(''), 1500);
  }, []);

  const removeItem = useCallback((idx) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem('omnitool-clipboard', JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem('omnitool-clipboard');
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('omnitool-clipboard') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">📋</span>
        <h1 className="font-heading text-2xl font-bold text-text">Clipboard Manager</h1>
      </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <label className="text-xs text-text-tertiary mb-1 block">Text</label>
            <textarea value={current} onChange={(e) => setCurrent(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <div className="flex gap-2">
              <button onClick={copy} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Copy</button>
              <button onClick={paste} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">Paste</button>
              <span className="ml-auto text-[10px] text-text-tertiary self-center">{current.length} chars · {current.trim() ? current.trim().split(/\s+/).length : 0} words</span>
            </div>
            {status && <div className="text-xs text-cat-success">{status}</div>}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">History ({items.length})</span>
              {items.length > 0 && <button onClick={clear} className="text-[10px] text-cat-text hover:text-cat-text/80 cursor-pointer">Clear</button>}
            </div>
            {items.length === 0 ? (
              <div className="text-sm text-text-tertiary">No history yet. Copy something to save it.</div>
            ) : (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                {items.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm hover:border-primary/30 transition-colors">
                    <span className="text-xs text-text-tertiary shrink-0">{i + 1}.</span>
                    <span onClick={() => { restore(t); }} className="truncate text-text flex-1 cursor-pointer">{t}</span>
                    <button onClick={() => copyItem(t)} className="text-[10px] text-text-secondary hover:text-primary cursor-pointer shrink-0" title="Copy">⧉</button>
                    <button onClick={() => removeItem(i)} className="text-[10px] text-text-secondary hover:text-cat-text cursor-pointer shrink-0" title="Delete">✕</button>
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
