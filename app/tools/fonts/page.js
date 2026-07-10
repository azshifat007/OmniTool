'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const COMMON_FONTS = [
  'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Garamond',
  'Courier New', 'Brush Script MT', 'Impact', 'Comic Sans MS', 'Lucida Console', 'Palatino',
  'Book Antiqua', 'Arial Black', 'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia',
  'Corbel', 'Franklin Gothic Medium', 'Gabriola', 'Lucida Sans Unicode', 'Segoe UI',
  'Segoe Print', 'Segoe Script', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol',
];

export default function FontsPage() {
  const { addEntry } = useHistory();
  const [fonts, setFonts] = useState([]);
  const [preview, setPreview] = useState('The quick brown fox jumps over the lazy dog.');
  const [loading, setLoading] = useState(false);

  const loadFonts = useCallback(async () => {
    setLoading(true);
    addEntry('Font Viewer');
    try {
      if ('queryLocalFonts' in navigator) {
        const f = await navigator.queryLocalFonts();
        setFonts(f.map(f => f.family).filter((v, i, a) => a.indexOf(v) === i).sort());
      } else {
        setFonts(COMMON_FONTS);
      }
    } catch {
      setFonts(COMMON_FONTS);
    } finally {
      setLoading(false);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">F</span>
        <h1 className="font-heading text-2xl font-bold text-text">Font Viewer</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={loadFonts} disabled={loading}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">{loading ? 'Loading...' : 'Load Fonts'}</button>
            <span className="text-xs text-text-tertiary">{fonts.length > 0 ? `${fonts.length} fonts` : ''}</span>
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Preview Text</label>
            <input value={preview} onChange={(e) => setPreview(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          {fonts.length > 0 && (
            <div className="max-h-[400px] overflow-y-auto space-y-1 border border-border/50 rounded-xl">
              {fonts.map(f => (
                <div key={f} className="flex items-center gap-3 px-3 py-2 hover:bg-surface/50 transition-colors border-b border-border/20 last:border-0">
                  <span className="text-xs text-text-tertiary w-40 truncate shrink-0 font-mono">{f}</span>
                  <span className="text-sm text-text truncate" style={{ fontFamily: f }}>{preview || 'Sample text'}</span>
                  <CopyButton text={f} className="text-[10px] shrink-0 ml-auto" />
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
