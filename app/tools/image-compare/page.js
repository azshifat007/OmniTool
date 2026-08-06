'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ImageComparePage() {
  const { addEntry } = useHistory();
  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const handleImg1 = (e) => {
    const f = e.target.files[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => setImg1(ev.target.result); r.readAsDataURL(f); }
  };
  const handleImg2 = (e) => {
    const f = e.target.files[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => setImg2(ev.target.result); r.readAsDataURL(f); }
  };

  const handleMove = useCallback((e) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, [dragging]);

  const ready = img1 && img2;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">⇔</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Comparer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-4">
              {ready ? (
                <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg border border-border select-none cursor-col-resize"
                  style={{ aspectRatio: '16/9', maxHeight: 500 }}
                  onMouseMove={handleMove} onTouchMove={handleMove}
                  onMouseDown={() => setDragging(true)} onTouchStart={() => setDragging(true)}
                  onMouseUp={() => setDragging(false)} onTouchEnd={() => setDragging(false)}
                  onMouseLeave={() => setDragging(false)}>
                  <img src={img2} alt="After" className="absolute inset-0 w-full h-full object-contain" />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    <img src={img1} alt="Before" className="absolute inset-0 w-full h-full object-contain" style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }} />
                  </div>
                  <div className="absolute inset-y-0" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
                    <div className="h-full w-0.5 bg-white shadow-md" />
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <span className="text-xs text-gray-700 font-bold">⇔</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">Before</div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">After</div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-xs text-text-tertiary bg-surface rounded-lg border border-border">
                  Upload two images to compare
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Before Image</label>
                <input type="file" accept="image/*" onChange={handleImg1}
                  className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
                {img1 && <img src={img1} alt="Before" className="mt-2 h-16 rounded border border-border object-contain bg-surface" />}
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">After Image</label>
                <input type="file" accept="image/*" onChange={handleImg2}
                  className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
                {img2 && <img src={img2} alt="After" className="mt-2 h-16 rounded border border-border object-contain bg-surface" />}
              </div>

              {ready && (
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Split: {sliderPos}%</label>
                  <input type="range" min={0} max={100} value={sliderPos} onChange={(e) => setSliderPos(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
