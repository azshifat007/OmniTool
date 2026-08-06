'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const MAGNIFIER_SIZE = 5;
const ZOOM = 10;

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export default function ColorPickerPage() {
  const { addEntry } = useHistory();
  const canvasRef = useRef(null);
  const magnifierRef = useRef(null);
  const [image, setImage] = useState(null);
  const [pickedColor, setPickedColor] = useState(null);
  const [history, setHistory] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [coords, setCoords] = useState({ x: '', y: '' });
  const [imgLoaded, setImgLoaded] = useState(false);

  const drawImage = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const maxW = 600, maxH = 400;
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > maxW) { h = (h * maxW) / w; w = maxW; }
    if (h > maxH) { w = (w * maxH) / h; h = maxH; }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    setImgLoaded(true);
  }, []);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target.result);
        drawImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [drawImage]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const pickColor = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] === 0) return;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);
    const color = {
      hex,
      rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      r: pixel[0], g: pixel[1], b: pixel[2],
    };
    setPickedColor(color);
    setHistory((prev) => {
      const next = [color, ...prev.filter((c) => c.hex !== color.hex)].slice(0, 10);
      return next;
    });
    addEntry('Image Color Picker');
  }, [addEntry]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    pickColor(x, y);
  }, [pickColor]);

  const handleCanvasMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y });
    drawMagnifier(x, y);
  }, []);

  const drawMagnifier = useCallback((cx, cy) => {
    const canvas = canvasRef.current;
    const mag = magnifierRef.current;
    if (!canvas || !mag) return;
    const ctx = canvas.getContext('2d');
    const mg = mag.getContext('2d');
    const half = Math.floor(MAGNIFIER_SIZE / 2);
    const size = MAGNIFIER_SIZE * ZOOM;
    mag.width = size;
    mag.height = size;

    const sx = Math.max(0, cx - half);
    const sy = Math.max(0, cy - half);

    const imgData = ctx.getImageData(sx, sy, MAGNIFIER_SIZE, MAGNIFIER_SIZE);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = MAGNIFIER_SIZE;
    tempCanvas.height = MAGNIFIER_SIZE;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imgData, 0, 0);

    mg.imageSmoothingEnabled = false;
    mg.clearRect(0, 0, size, size);
    mg.drawImage(tempCanvas, 0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE, 0, 0, size, size);

    mg.strokeStyle = '#fff';
    mg.lineWidth = 1.5;
    const center = half * ZOOM;
    mg.strokeRect(center - ZOOM / 2, center - ZOOM / 2, ZOOM, ZOOM);
  }, []);

  const handleCoordPick = useCallback(() => {
    const x = parseInt(coords.x);
    const y = parseInt(coords.y);
    if (isNaN(x) || isNaN(y) || !imgLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
    pickColor(x, y);
  }, [coords, imgLoaded, pickColor]);

  useEffect(() => {
    if (!image && !imgLoaded) return;
    setImage(null);
    setPickedColor(null);
    setMousePos(null);
    setImgLoaded(false);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Color Picker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors mb-4"
                onClick={() => document.getElementById('file-input-color-picker')?.click()}
              >
                <input id="file-input-color-picker" type="file" accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
                <div className="text-xs text-text-tertiary mb-1">Drop image here or click to browse</div>
              </div>
              {image && (
                <div className="relative">
                  <canvas ref={canvasRef} onClick={handleCanvasClick} onMouseMove={handleCanvasMove}
                    onMouseLeave={() => setMousePos(null)}
                    className="w-full rounded-lg border border-border cursor-crosshair" />
                  {mousePos && (
                    <div className="absolute top-2 left-2 bg-surface/90 rounded px-2 py-1 text-xs font-mono text-text border border-border/50">
                      {mousePos.x}, {mousePos.y}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-2 block">Pick by Coordinates</label>
              <div className="flex gap-2">
                <input type="number" placeholder="X" value={coords.x} onChange={(e) => setCoords((c) => ({ ...c, x: e.target.value }))}
                  className="w-20 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <input type="number" placeholder="Y" value={coords.y} onChange={(e) => setCoords((c) => ({ ...c, y: e.target.value }))}
                  className="w-20 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={handleCoordPick}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Pick</button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Magnifier</span>
              <div className="flex items-center justify-center bg-surface rounded-xl border border-border p-3 min-h-[120px]">
                {mousePos && imgLoaded ? (
                  <canvas ref={magnifierRef} className="rounded-lg border border-border" style={{ width: MAGNIFIER_SIZE * ZOOM, height: MAGNIFIER_SIZE * ZOOM }} />
                ) : (
                  <span className="text-xs text-text-tertiary">Hover over image</span>
                )}
              </div>
              {mousePos && <p className="text-xs text-text-tertiary mt-2 text-center font-mono">Pixel: ({mousePos.x}, {mousePos.y})</p>}
            </div>
          </GlassCard>

          {pickedColor && (
            <GlassCard>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: pickedColor.hex }} />
                  <span className="text-xs text-text-tertiary">Picked Color</span>
                </div>
                {[
                  { label: 'HEX', value: pickedColor.hex },
                  { label: 'RGB', value: pickedColor.rgb },
                  { label: 'HSL', value: pickedColor.hsl },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 flex items-center gap-3 border border-border/50">
                    <span className="text-xs text-text-tertiary w-10">{label}</span>
                    <span className="text-sm font-mono text-text flex-1">{value}</span>
                    <CopyButton text={value} />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {history.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">History (last 10)</span>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(history.map((c) => c.hex).join(', '))}
                      className="text-[10px] text-text-secondary hover:text-primary cursor-pointer">Copy</button>
                    <button onClick={() => setHistory([])}
                      className="text-[10px] text-cat-text hover:text-cat-text/80 cursor-pointer">Clear</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border border-border cursor-pointer" style={{ background: c.hex }}
                        title={c.hex} onClick={() => setPickedColor(c)} />
                      <span className="text-[10px] font-mono text-text-tertiary">{c.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
