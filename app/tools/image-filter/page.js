'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const FILTERS = {
  grayscale: { label: 'Grayscale', fn: (r,g,b) => [0.299*r+0.587*g+0.114*b, 0.299*r+0.587*g+0.114*b, 0.299*r+0.587*g+0.114*b] },
  sepia: { label: 'Sepia', fn: (r,g,b) => [Math.min(255,r*0.393+g*0.769+b*0.189), Math.min(255,r*0.349+g*0.686+b*0.168), Math.min(255,r*0.272+g*0.534+b*0.131)] },
  invert: { label: 'Invert', fn: (r,g,b) => [255-r, 255-g, 255-b] },
};

export default function ImageFilterPage() {
  const canvasRef = useRef(null);
  const [imgEl, setImgEl] = useState(null);
  const [filter, setFilter] = useState('grayscale');
  const [intensity, setIntensity] = useState(1);
  const [rendered, setRendered] = useState(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setRendered(null);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const applyFilter = useCallback(() => {
    if (!imgEl) return;
    const canvas = canvasRef.current;
    const maxW = 600;
    const scale = Math.min(1, maxW / imgEl.width);
    canvas.width = Math.round(imgEl.width * scale);
    canvas.height = Math.round(imgEl.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = data.data;
    const filterFn = FILTERS[filter].fn;
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = filterFn(pixels[i], pixels[i+1], pixels[i+2]);
      pixels[i] = pixels[i] + (r - pixels[i]) * intensity;
      pixels[i+1] = pixels[i+1] + (g - pixels[i+1]) * intensity;
      pixels[i+2] = pixels[i+2] + (b - pixels[i+2]) * intensity;
    }
    ctx.putImageData(data, 0, 0);
    setRendered(canvas.toDataURL());
  }, [imgEl, filter, intensity]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `${filter}.png`;
    link.href = rendered;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◑</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Filters</h1>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <GlassCard>
        <div className="p-4 space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/40 transition-colors">
            <span className="text-3xl text-text-tertiary mb-2">◑</span>
            <span className="text-sm text-text-secondary">{imgEl ? 'Change image' : 'Upload an image'}</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {imgEl && (
            <>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FILTERS).map(([k, v]) => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      filter === k ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
                    }`}>{v.label}</button>
                ))}
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1.5 block">Intensity: {Math.round(intensity * 100)}%</label>
                <input type="range" min={0} max={1} step={0.05} value={intensity}
                  onChange={e => setIntensity(parseFloat(e.target.value))} className="w-full accent-primary cursor-pointer" />
              </div>
              <div className="flex gap-2">
                <button onClick={applyFilter}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Apply</button>
                {rendered && <button onClick={download}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">Download</button>}
              </div>
            </>
          )}
        </div>
      </GlassCard>
      {rendered && (
        <GlassCard>
          <div className="p-4">
            <div className="text-xs text-text-tertiary mb-2">{FILTERS[filter].label}</div>
            <img src={rendered} alt="Filtered" className="max-w-full rounded-xl border border-border" />
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
