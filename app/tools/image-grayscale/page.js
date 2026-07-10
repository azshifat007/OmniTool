'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ImageGrayscalePage() {
  const { addEntry } = useHistory();
  const [original, setOriginal] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [mode, setMode] = useState('grayscale');
  const [intensity, setIntensity] = useState(100);
  const canvasRef = useRef(null);

  const process = useCallback((imgSrc) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const factor = intensity / 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        let val;
        if (mode === 'grayscale') {
          val = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = r + (val - r) * factor;
          data[i + 1] = g + (val - g) * factor;
          data[i + 2] = b + (val - b) * factor;
        } else if (mode === 'sepia') {
          val = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = r + (val + 40 - r) * factor;
          data[i + 1] = g + (val + 20 - g) * factor;
          data[i + 2] = b + (val - 30 - b) * factor;
        } else if (mode === 'invert') {
          data[i] = r + (255 - r - r) * factor;
          data[i + 1] = g + (255 - g - g) * factor;
          data[i + 2] = b + (255 - b - b) * factor;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setProcessed(canvas.toDataURL());
    };
    img.src = imgSrc;
  }, [mode, intensity]);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    addEntry('Image Grayscale');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setOriginal(ev.target.result);
      process(ev.target.result);
    };
    reader.readAsDataURL(file);
  }, [process, addEntry]);

  const handleReprocess = useCallback(() => {
    if (original) process(original);
  }, [original, process]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◑</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Grayscale</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert images to grayscale, sepia, or invert colors with adjustable intensity.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">🖼</span>
            <span className="text-sm text-text-secondary">Upload an image</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {original && (
            <>
              <div className="flex gap-2 justify-center">
                {['grayscale', 'sepia', 'invert'].map(m => (
                  <button key={m} onClick={() => { setMode(m); }} onMouseUp={handleReprocess}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${mode === m ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{m}</button>
                ))}
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">
                  Intensity: <span className="text-text">{intensity}%</span>
                </label>
                <input type="range" min={0} max={100} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} onMouseUp={handleReprocess}
                  className="w-full accent-primary cursor-pointer" />
              </div>
              {processed && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-text-tertiary block mb-1">Original</span>
                    <img src={original} className="w-full rounded-xl border border-border/50" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary block mb-1">Processed</span>
                    <img src={processed} className="w-full rounded-xl border border-border/50" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
