'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ImageRotatePage() {
  const { addEntry } = useHistory();
  const [imgSrc, setImgSrc] = useState(null);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((e) => {
    const f = e.target.files[0];
    if (!f) return;
    addEntry('Image Rotator');
    const reader = new FileReader();
    reader.onload = (ev) => setImgSrc(ev.target.result);
    reader.readAsDataURL(f);
  }, [addEntry]);

  const handleReset = useCallback(() => {
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'rotated-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">⟳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Rotator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <input type="file" accept="image/*" onChange={handleFile} ref={fileRef}
            className="w-full text-sm text-text file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer file:cursor-pointer" />
        </div>
      </GlassCard>

      {imgSrc && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-4">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex items-end gap-4">
                <label className="flex-1">
                  <span className="text-xs text-text-tertiary block mb-1">Angle: {angle}°</span>
                  <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </label>
                <label className="flex items-center gap-2 pb-2">
                  <input type="checkbox" checked={flipH} onChange={e => setFlipH(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer" />
                  <span className="text-xs text-text-tertiary">Flip H</span>
                </label>
                <label className="flex items-center gap-2 pb-2">
                  <input type="checkbox" checked={flipV} onChange={e => setFlipV(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer" />
                  <span className="text-xs text-text-tertiary">Flip V</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">
                  Reset
                </button>
                <button onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Download
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 flex items-center justify-center">
              <div className="relative inline-flex" style={{ transform: `rotate(${angle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`, transition: 'transform 0.2s' }}>
                <canvas ref={canvasRef} />
                <img src={imgSrc} alt="Preview" className="max-w-full max-h-[400px] rounded-lg"
                  onLoad={(e) => {
                    const c = canvasRef.current;
                    if (c) {
                      c.width = e.target.naturalWidth;
                      c.height = e.target.naturalHeight;
                      const ctx = c.getContext('2d');
                      ctx.drawImage(e.target, 0, 0);
                    }
                  }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
