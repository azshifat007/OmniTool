'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const MATRICES = {
  normal: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
  protanopia: [0.567,0.433,0,0, 0.558,0.442,0,0, 0,0.242,0.758,0, 0,0,0,1],
  deuteranopia: [0.625,0.375,0,0, 0.7,0.3,0,0, 0,0.3,0.7,0, 0,0,0,1],
  tritanopia: [0.95,0.05,0,0, 0,0.433,0.567,0, 0,0.475,0.525,0, 0,0,0,1],
  achromatopsia: [0.299,0.587,0.114,0, 0.299,0.587,0.114,0, 0.299,0.587,0.114,0, 0,0,0,1],
};

const LABELS = {
  normal: 'Normal Vision',
  protanopia: 'Protanopia (Red-Blind)',
  deuteranopia: 'Deuteranopia (Green-Blind)',
  tritanopia: 'Tritanopia (Blue-Blind)',
  achromatopsia: 'Achromatopsia (Total)',
};

function applyMatrix(ctx, w, h, matrix) {
  const data = ctx.getImageData(0, 0, w, h);
  const pixels = data.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    pixels[i]   = r*matrix[0] + g*matrix[1] + b*matrix[2] + matrix[3]*255;
    pixels[i+1] = r*matrix[4] + g*matrix[5] + b*matrix[6] + matrix[7]*255;
    pixels[i+2] = r*matrix[8] + g*matrix[9] + b*matrix[10] + matrix[11]*255;
  }
  ctx.putImageData(data, 0, 0);
}

export default function ColorBlindnessPage() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState('protanopia');
  const [rendered, setRendered] = useState(false);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setRendered(false);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const render = useCallback(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const maxW = 600;
    const scale = Math.min(1, maxW / image.width);
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (type !== 'normal') applyMatrix(ctx, canvas.width, canvas.height, MATRICES[type]);
    setRendered(true);
  }, [image, type]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `${LABELS[type].toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Blindness Simulator</h1>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <GlassCard>
        <div className="p-4 space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/40 transition-colors">
            <span className="text-3xl text-text-tertiary mb-2">◉</span>
            <span className="text-sm text-text-secondary">{image ? 'Change image' : 'Upload an image to simulate'}</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {image && (
            <>
              <div>
                <label className="text-xs text-text-tertiary mb-1.5 block">Vision Type</label>
                <select value={type} onChange={e => { setType(e.target.value); setRendered(false); }}
                  className="w-full bg-surface text-text rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary/50 cursor-pointer">
                  {Object.entries(LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={render}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Simulate
                </button>
                {rendered && (
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
      {rendered && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <GlassCard>
            <div className="p-3">
              <div className="text-xs text-text-tertiary mb-2">Original</div>
              <img src={image.src} alt="Original" className="w-full rounded-lg border border-border" />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-3">
              <div className="text-xs text-text-tertiary mb-2">{LABELS[type]}</div>
              <img src={canvasRef.current.toDataURL()} alt="Simulated" className="w-full rounded-lg border border-border" />
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
}
