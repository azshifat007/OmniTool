'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function extractColors(data, count) {
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
    pixels.push({ r, g, b, key });
  }

  const buckets = {};
  for (const p of pixels) {
    if (!buckets[p.key]) buckets[p.key] = { r: 0, g: 0, b: 0, count: 0 };
    buckets[p.key].r += p.r;
    buckets[p.key].g += p.g;
    buckets[p.key].b += p.b;
    buckets[p.key].count++;
  }

  const sorted = Object.entries(buckets)
    .map(([key, val]) => ({ hex: rgbToHex(val.r / val.count, val.g / val.count, val.b / val.count), count: val.count }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, count);
}

export default function PaletteFromImagePage() {
  const { addEntry } = useHistory();
  const [image, setImage] = useState(null);
  const [colors, setColors] = useState([]);
  const [count, setCount] = useState(6);
  const canvasRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setColors([]);
    };
    reader.readAsDataURL(file);
  };

  const extract = () => {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const maxSize = 200;
      const scale = Math.min(1, maxSize / Math.max(canvas.width, canvas.height));
      const sw = Math.round(canvas.width * scale);
      const sh = Math.round(canvas.height * scale);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = sw;
      tempCanvas.height = sh;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0, sw, sh);

      const data = tempCtx.getImageData(0, 0, sw, sh).data;
      const extracted = extractColors(data, count);
      setColors(extracted);
      addEntry('Color Palette from Image');
    };
    img.src = image;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Palette from Image</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImage}
                className="w-full text-xs text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
            </div>

            {image && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img src={image} alt="Uploaded" className="w-full h-48 object-contain bg-surface" />
              </div>
            )}

            {image && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-text-tertiary mb-1 block">Colors: {count}</label>
                  <input type="range" min={3} max={12} value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
                <button onClick={extract} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Extract</button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Palette</span>
            {colors.length > 0 ? (
              <div className="space-y-2">
                <div className="flex rounded-lg overflow-hidden border border-border h-12">
                  {colors.map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.hex} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 bg-surface rounded-lg p-2 border border-border">
                      <div className="w-8 h-8 rounded-lg border border-border shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="text-xs font-mono text-text">{c.hex}</span>
                      <span className="text-[10px] text-text-secondary ml-auto">{c.count} pixels</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-xs text-text-tertiary">
                {image ? 'Click Extract to generate palette' : 'Upload an image to start'}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
