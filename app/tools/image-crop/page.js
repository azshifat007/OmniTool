'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

export default function ImageCropPage() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [drag, setDrag] = useState(null);
  const [crop, setCrop] = useState(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [preview, setPreview] = useState(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setCrop(null);
      setPreview(null);
      const canvas = canvasRef.current;
      const maxW = 700, maxH = 500;
      const s = Math.min(1, maxW / img.width, maxH / img.height);
      canvas.width = Math.round(img.width * s);
      canvas.height = Math.round(img.height * s);
      setScale({ x: img.width / canvas.width, y: img.height / canvas.height });
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width), y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height) };
  };

  const onDown = (e) => {
    e.preventDefault();
    const p = getPos(e);
    setDrag({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  };
  const onMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const p = getPos(e);
    const nd = { ...drag, x2: p.x, y2: p.y };
    setDrag(nd);
    const ctx = canvasRef.current.getContext('2d');
    const cvs = canvasRef.current;
    ctx.drawImage(imgEl, 0, 0, cvs.width, cvs.height);
    const x = Math.min(nd.x1, nd.x2), y = Math.min(nd.y1, nd.y2);
    const w = Math.abs(nd.x2 - nd.x1), h = Math.abs(nd.y2 - nd.y1);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, cvs.width, y);
    ctx.fillRect(0, y + h, cvs.width, cvs.height - y - h);
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, cvs.width - x - w, h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    if (w > 10 && h > 10) setCrop({ x: Math.round(x * scale.x), y: Math.round(y * scale.y), w: Math.round(w * scale.x), h: Math.round(h * scale.y) });
  };
  const onUp = () => { setDrag(null); };

  const doCrop = () => {
    if (!crop || !imgEl) return;
    const cvs = document.createElement('canvas');
    cvs.width = crop.w;
    cvs.height = crop.h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(imgEl, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    setPreview(cvs.toDataURL());
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'cropped.png';
    link.href = preview;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">⊟</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Cropper</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl py-8 cursor-pointer hover:border-primary/40 transition-colors">
            <span className="text-3xl text-text-tertiary mb-2">⊟</span>
            <span className="text-sm text-text-secondary">{imgEl ? 'Change image' : 'Upload an image to crop'}</span>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {imgEl && (
            <>
              <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                className="w-full rounded-xl border border-border cursor-crosshair" style={{ maxHeight: 500 }} />
              {crop && <div className="text-xs text-text-tertiary">Selection: {crop.w} × {crop.h}px at ({crop.x}, {crop.y})</div>}
              <div className="flex gap-2">
                <button onClick={doCrop} disabled={!crop}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                  Crop
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
            <div className="text-xs text-text-tertiary mb-2">Preview ({crop.w} × {crop.h}px)</div>
            <img src={preview} alt="Cropped" className="max-w-full rounded-xl border border-border" />
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
