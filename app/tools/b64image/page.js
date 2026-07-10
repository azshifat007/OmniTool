'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function B64ImagePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [mime, setMime] = useState('image/png');
  const canvasRef = useRef(null);

  const handleDecode = useCallback(() => {
    setError('');
    setPreview(null);
    if (!input.trim()) return;
    try {
      const cleaned = input.trim().replace(/^data:image\/\w+;base64,/, '');
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) throw new Error('Invalid Base64 data');
      setPreview(`data:${mime};base64,${cleaned}`);
      addEntry('Base64 Image Viewer');
    } catch (e) {
      setError(e.message);
    }
  }, [input, mime, addEntry]);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setInput(b64);
      setPreview(b64);
      addEntry('Base64 Image Viewer');
    };
    reader.readAsDataURL(file);
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">▣</span>
        <h1 className="font-heading text-2xl font-bold text-text">Base64 Image Viewer</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">MIME Type</label>
              <select value={mime} onChange={(e) => setMime(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste Base64 image data here..." />
            <div className="flex gap-2">
              <button onClick={handleDecode} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Preview</button>
              <label className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">
                Upload Image
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              {input && <CopyButton text={input} />}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
            {preview ? (
              <div className="flex items-center justify-center bg-surface rounded-lg border border-border/50 p-4 min-h-[200px]">
                <img src={preview} alt="Base64 preview" className="max-w-full max-h-[300px] object-contain rounded" />
              </div>
            ) : (
              <div className="flex items-center justify-center bg-surface rounded-lg border border-border/50 p-4 min-h-[200px]">
                <span className="text-text-tertiary text-sm">No image loaded</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
