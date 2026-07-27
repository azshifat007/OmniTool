'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];

export default function FaviconGenPage() {
  const { addEntry } = useHistory();
  const [image, setImage] = useState(null);
  const [previews, setPreviews] = useState({});
  const [selectedSize, setSelectedSize] = useState(32);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [padding, setPadding] = useState(10);
  const [shape, setShape] = useState('square');
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const loadImage = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        generatePreviews(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const generatePreviews = useCallback((img) => {
    const results = {};
    for (const size of SIZES) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = bgColor;
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, size, size);
      }

      const pad = (size * padding) / 100;
      const drawSize = size - pad * 2;
      const aspect = img.width / img.height;
      let dw, dh;
      if (aspect > 1) { dh = drawSize; dw = drawSize * aspect; }
      else { dw = drawSize; dh = drawSize / aspect; }
      const dx = pad + (drawSize - dw) / 2;
      const dy = pad + (drawSize - dh) / 2;

      if (shape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(img, dx, dy, dw, dh);
      }

      results[size] = canvas.toDataURL('image/png');
    }
    setPreviews(results);
  }, [bgColor, padding, shape]);

  const downloadFavicon = useCallback((size) => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    const pad = (size * padding) / 100;
    const drawSize = size - pad * 2;
    const aspect = image.width / image.height;
    let dw, dh;
    if (aspect > 1) { dh = drawSize; dw = drawSize * aspect; }
    else { dw = drawSize; dh = drawSize / aspect; }
    const dx = pad + (drawSize - dw) / 2;
    const dy = pad + (drawSize - dh) / 2;

    if (shape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(image, dx, dy, dw, dh);
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `favicon-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
    addEntry('Favicon Generator');
  }, [image, bgColor, padding, shape, addEntry]);

  const generateICO = useCallback(() => {
    if (!image) return;
    const sizes = [16, 32, 48];
    const canvases = sizes.map(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      const pad = (size * padding) / 100;
      const drawSize = size - pad * 2;
      const aspect = image.width / image.height;
      let dw, dh;
      if (aspect > 1) { dh = drawSize; dw = drawSize * aspect; }
      else { dw = drawSize; dh = drawSize / aspect; }
      const dx = pad + (drawSize - dw) / 2;
      const dy = pad + (drawSize - dh) / 2;
      ctx.drawImage(image, dx, dy, dw, dh);
      return canvas;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(canvases[1], 0, 0);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon.ico';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
    addEntry('Favicon Generator');
  }, [image, bgColor, padding, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◆</span>
        <h1 className="font-heading text-2xl font-bold text-text">Favicon Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
                <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files[0] && loadImage(e.target.files[0])} className="hidden" />
                {image ? (
                  <img src={image.src} alt="Source" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <>
                    <div className="text-3xl mb-2 opacity-50">🖼</div>
                    <p className="text-text-tertiary text-sm">Drop an image or click to browse</p>
                  </>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-border" />
                  <input value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="flex-1 bg-surface rounded-lg px-3 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Padding: {padding}%</label>
                <input type="range" min="0" max="40" value={padding} onChange={e => setPadding(+e.target.value)}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Shape</label>
                <div className="flex gap-2">
                  {['square', 'circle'].map(s => (
                    <button key={s} onClick={() => setShape(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        shape === s ? 'bg-primary text-white' : 'text-text-tertiary bg-surface border border-border'
                      }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-tertiary font-semibold">Generated Favicons</span>
              {image && (
                <button onClick={generateICO}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Download .ico
                </button>
              )}
            </div>
            {Object.keys(previews).length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {SIZES.map(size => (
                  <div key={size} className="text-center">
                    <div className="bg-gray-100 rounded-lg p-2 mb-1 flex items-center justify-center" style={{ minHeight: 64 }}>
                      <img src={previews[size]} alt={`${size}x${size}`} style={{ width: Math.min(size, 48), height: Math.min(size, 48) }} />
                    </div>
                    <span className="text-[10px] text-text-tertiary block">{size}×{size}</span>
                    <button onClick={() => downloadFavicon(size)}
                      className="text-[10px] text-primary hover:underline cursor-pointer">Download</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-tertiary text-sm">
                Upload an image to generate favicons
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
