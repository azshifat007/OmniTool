'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

export default function ImageResizerPage() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [original, setOriginal] = useState({ w: 0, h: 0, name: '' });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [preview, setPreview] = useState(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setOriginal({ w: img.width, h: img.height, name: file.name });
      setWidth(img.width);
      setHeight(img.height);
      setPreview(null);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const updateWidth = (v) => {
    const w = parseInt(v) || 0;
    setWidth(w);
    if (lockRatio && original.w) setHeight(Math.round(w * (original.h / original.w)));
  };

  const updateHeight = (v) => {
    const h = parseInt(v) || 0;
    setHeight(h);
    if (lockRatio && original.h) setWidth(Math.round(h * (original.w / original.h)));
  };

  const resize = useCallback(() => {
    if (!image || !width || !height) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    setPreview(canvas.toDataURL('image/png'));
  }, [image, width, height]);

  const download = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.download = original.name.replace(/\.[^.]+$/, `-${width}x${height}.png`);
    link.href = preview;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">⧉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Resizer</h1>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <GlassCard>
        <div className="p-4 space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/40 transition-colors">
            <span className="text-3xl text-text-tertiary mb-2">⧉</span>
            <span className="text-sm text-text-secondary">{image ? original.name : 'Click to upload image'}</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {image && (
            <>
              <div className="text-xs text-text-tertiary">Original: {original.w} × {original.h}px</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">Width (px)</label>
                  <input type="number" value={width} onChange={e => updateWidth(e.target.value)} min={1}
                    className="w-full bg-surface text-text rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">Height (px)</label>
                  <input type="number" value={height} onChange={e => updateHeight(e.target.value)} min={1}
                    className="w-full bg-surface text-text rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary/50" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)}
                  className="accent-primary rounded cursor-pointer" />
                Lock aspect ratio
              </label>
              <div className="flex gap-2">
                <button onClick={resize}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Resize
                </button>
                {preview && (
                  <button onClick={download}
                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                    Download
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </GlassCard>
      {preview && (
        <GlassCard>
          <div className="p-4">
            <div className="text-xs text-text-tertiary mb-2">Preview ({width} × {height}px)</div>
            <img src={preview} alt="Resized" className="max-w-full rounded-xl border border-border" />
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
