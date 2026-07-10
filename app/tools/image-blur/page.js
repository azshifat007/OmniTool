'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ImageBlurPage() {
  const { addEntry } = useHistory();
  const [original, setOriginal] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [radius, setRadius] = useState(5);
  const canvasRef = useRef(null);

  const process = useCallback((imgSrc, blurRadius) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const w = canvas.width, h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const r = Math.max(1, blurRadius);
      const size = r * 2 + 1;
      const kernel = new Float32Array(size * size);
      let sum = 0;
      for (let i = -r; i <= r; i++) {
        for (let j = -r; j <= r; j++) {
          const v = Math.exp(-(i * i + j * j) / (2 * r));
          kernel[(i + r) * size + (j + r)] = v;
          sum += v;
        }
      }
      for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

      const output = new Uint8ClampedArray(data.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
          for (let ky = -r; ky <= r; ky++) {
            for (let kx = -r; kx <= r; kx++) {
              const px = Math.min(w - 1, Math.max(0, x + kx));
              const py = Math.min(h - 1, Math.max(0, y + ky));
              const idx = (py * w + px) * 4;
              const kVal = kernel[(ky + r) * size + (kx + r)];
              rSum += data[idx] * kVal;
              gSum += data[idx + 1] * kVal;
              bSum += data[idx + 2] * kVal;
              aSum += data[idx + 3] * kVal;
            }
          }
          const idx = (y * w + x) * 4;
          output[idx] = rSum;
          output[idx + 1] = gSum;
          output[idx + 2] = bSum;
          output[idx + 3] = aSum;
        }
      }
      ctx.putImageData(new ImageData(output, w, h), 0, 0);
      setProcessed(canvas.toDataURL());
    };
    img.src = imgSrc;
  }, []);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    addEntry('Image Blur');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setOriginal(ev.target.result);
      process(ev.target.result, radius);
    };
    reader.readAsDataURL(file);
  }, [process, radius, addEntry]);

  const handleRadiusChange = useCallback((v) => {
    const r = Number(v);
    setRadius(r);
    if (original) process(original, r);
  }, [original, process]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◑</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Blur</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Apply Gaussian blur to images with adjustable radius.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">🖼</span>
            <span className="text-sm text-text-secondary">Upload an image</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {original && (
            <>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Blur Radius: {radius}</label>
                <input type="range" min={1} max={20} value={radius} onChange={(e) => handleRadiusChange(e.target.value)}
                  className="w-full accent-primary cursor-pointer" />
              </div>
              {processed && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-text-tertiary block mb-1">Original</span>
                    <img src={original} className="w-full rounded-xl border border-border/50" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary block mb-1">Blurred</span>
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
