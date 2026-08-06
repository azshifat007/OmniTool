'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

let nextId = 1;

function newNote(title) {
  return { id: nextId++, title: title || 'Untitled', content: '', updated: Date.now() };
}

export default function ScratchpadPage() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('scratchpad-notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length) setActiveId(parsed[0].id);
        nextId = Math.max(...parsed.map(n => n.id), 0) + 1;
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('scratchpad-notes', JSON.stringify(notes));
  }, [notes, loaded]);

  const active = notes.find(n => n.id === activeId) || null;

  const addNote = useCallback(() => {
    const n = newNote();
    setNotes(prev => [...prev, n]);
    setActiveId(n.id);
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      if (activeId === id) setActiveId(next.length ? next[0].id : null);
      return next;
    });
  }, [activeId]);

  const updateContent = useCallback((content) => {
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, content, updated: Date.now() } : n));
  }, [activeId]);

  const updateTitle = useCallback((title) => {
    setNotes(prev => prev.map(n => n.id === activeId ? { ...n, title, updated: Date.now() } : n));
  }, [activeId]);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">✍</span>
        <h1 className="font-heading text-2xl font-bold text-text">Scratchpad</h1>
      </div>
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="sm:w-56 shrink-0">
          <GlassCard>
            <div className="p-2 space-y-1">
              <button onClick={addNote}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                + New Note
              </button>
              <div className="max-h-96 overflow-y-auto space-y-0.5">
                {notes.map(n => (
                  <button key={n.id} onClick={() => setActiveId(n.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      activeId === n.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-text-secondary hover:bg-surface border border-transparent'
                    }`}>
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-[11px] text-text-tertiary mt-0.5">{formatDate(n.updated)}</div>
                  </button>
                ))}
                {notes.length === 0 && (
                  <div className="text-xs text-text-tertiary text-center py-4">No notes yet</div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
        <div className="flex-1">
          {active ? (
            <GlassCard>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input type="text" value={active.title} onChange={e => updateTitle(e.target.value)}
                    className="flex-1 bg-transparent text-text font-heading font-bold text-lg outline-none placeholder:text-text-tertiary" />
                  <button onClick={() => deleteNote(active.id)}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-surface text-cat-text border border-border hover:border-cat-text/40 transition-all cursor-pointer">
                    Delete
                  </button>
                </div>
                <textarea value={active.content} onChange={e => updateContent(e.target.value)}
                  placeholder="Start writing..."
                  className="w-full h-[400px] bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
                <div className="text-xs text-text-tertiary">
                  {active.content.length} characters · Last saved {formatDate(active.updated)}
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard>
              <div className="p-8 text-center text-text-tertiary text-sm">
                Select a note or create a new one
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
