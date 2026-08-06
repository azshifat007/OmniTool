'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const MAX_DIM = 1600;

function checkerboard(canvas) {
  const ctx = canvas.getContext('2d');
  const size = 16;
  ctx.save();
  for (let y = 0; y < canvas.height; y += size) {
    for (let x = 0; x < canvas.width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#ffffff' : '#e4e4e7';
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

function boxBlurAlpha(data, w, h, radius) {
  if (radius < 1) return;
  const tmp = new Float32Array(w * h);
  const src = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = data[i * 4 + 3] / 255;

  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -radius; x <= radius; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / (radius * 2 + 1);
      const out = x - radius;
      const add = src[y * w + Math.min(w - 1, Math.max(0, x + radius + 1))];
      const rem = src[y * w + Math.max(0, out)];
      acc += add - rem;
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      data[i * 4 + 3] = Math.round((acc / (radius * 2 + 1)) * 255);
      const out = y - radius;
      const add = tmp[Math.min(h - 1, Math.max(0, y + radius + 1)) * w + x];
      const rem = tmp[Math.max(0, out) * w + x];
      acc += add - rem;
    }
  }
}

export default function BackgroundRemoverPage() {
  const { addEntry } = useHistory();
  const [image, setImage] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [target, setTarget] = useState({ r: 255, g: 255, b: 255 });
  const [autoDetected, setAutoDetected] = useState(false);
  const [tolerance, setTolerance] = useState(38);
  const [softness, setSoftness] = useState(30);
  const [feather, setFeather] = useState(2);
  const [pickMode, setPickMode] = useState(false);
  const [exportBg, setExportBg] = useState('transparent');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [status, setStatus] = useState('');
  const sourceCanvasRef = useRef(null);
  const displayRef = useRef(null);
  const fileRef = useRef(null);
  const workRef = useRef({});

  const detectBackground = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const corners = [
      ctx.getImageData(0, 0, 1, 1).data,
      ctx.getImageData(w - 1, 0, 1, 1).data,
      ctx.getImageData(0, h - 1, 1, 1).data,
      ctx.getImageData(w - 1, h - 1, 1, 1).data,
    ];
    const avg = corners.reduce((a, c) => ({ r: a.r + c[0], g: a.g + c[1], b: a.b + c[2] }), { r: 0, g: 0, b: 0 });
    const t = {
      r: Math.round(avg.r / 4),
      g: Math.round(avg.g / 4),
      b: Math.round(avg.b / 4),
    };
    setTarget(t);
    setAutoDetected(true);
    workRef.current.picked = false;
  }, []);

  const process = useCallback(() => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const thresh = tolerance * 2.55;
    const soft = Math.max(1, softness * 2.55);
    const { r: tr, g: tg, b: tb } = target;

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - tr;
      const dg = data[i + 1] - tg;
      const db = data[i + 2] - tb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      let alpha = (dist - thresh) / soft;
      if (alpha < 0) alpha = 0;
      else if (alpha > 1) alpha = 1;
      data[i + 3] = Math.round(alpha * 255);
    }
    boxBlurAlpha(data, w, h, Math.round(feather));
    ctx.putImageData(imgData, 0, 0);

    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');
    octx.drawImage(canvas, 0, 0);
    workRef.current.outCanvas = out;

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(out.toDataURL('image/png'));
  }, [target, tolerance, softness, feather, resultUrl]);

  const loadImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setStatus('Processing…');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        sourceCanvasRef.current = canvas;
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl('');
        setOriginalUrl(img.src);
        setImage({ name: file.name, w: canvas.width, h: canvas.height });
        setAutoDetected(false);
        detectBackground(canvas);
        setStatus('');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [detectBackground, resultUrl]);

  const preview = useMemo(() => {
    if (!sourceCanvasRef.current) return '';
    const canvas = displayRef.current;
    if (canvas) {
      const src = sourceCanvasRef.current;
      if (canvas.width !== src.width || canvas.height !== src.height) {
        canvas.width = src.width;
        canvas.height = src.height;
      }
      const ctx = canvas.getContext('2d');
      checkerboard(canvas);
      ctx.drawImage(src, 0, 0);
    }
    return '';
  }, [image, target, tolerance, softness, feather, resultUrl]);

  const onPickClick = useCallback((e) => {
    const canvas = displayRef.current;
    if (!canvas || !pickMode || !sourceCanvasRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ctx = canvas.getContext('2d');
    const px = ctx.getImageData(Math.max(0, Math.min(canvas.width - 1, Math.round(sx))), Math.max(0, Math.min(canvas.height - 1, Math.round(sy))), 1, 1).data;
    setTarget({ r: px[0], g: px[1], b: px[2] });
    setAutoDetected(false);
    setPickMode(false);
  }, [pickMode]);

  const exportResult = useCallback(() => {
    const out = workRef.current.outCanvas;
    if (!out) return;
    addEntry('Background Remover');
    if (exportBg === 'transparent') {
      const a = document.createElement('a');
      a.href = out.toDataURL('image/png');
      a.download = `${(image?.name || 'image').replace(/\.[^.]+$/, '')}-removed.png`;
      a.click();
      return;
    }
    const color = exportBg === 'custom' ? customColor : exportBg;
    const flat = document.createElement('canvas');
    flat.width = out.width;
    flat.height = out.height;
    const ctx = flat.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(out, 0, 0);
    const a = document.createElement('a');
    a.href = flat.toDataURL('image/png');
    a.download = `${(image?.name || 'image').replace(/\.[^.]+$/, '')}-bg-${exportBg}.png`;
    a.click();
  }, [exportBg, customColor, image, addEntry]);

  const bgSwatches = [
    { v: 'transparent', l: 'Transparent' },
    { v: '#ffffff', l: 'White' },
    { v: '#000000', l: 'Black' },
    { v: 'custom', l: 'Custom' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl text-cat-media">✂️</span>
        <h1 className="font-heading text-2xl font-bold text-text">Background Remover</h1>
      </div>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">
        Remove solid-color backgrounds with smart edge smoothing — right in your browser. Best for product shots on white, green screens and flat-color backdrops.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); loadImage(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadImage(e.target.files[0])} />
              {image ? (
                <div>
                  <img src={originalUrl} alt="Source" className="max-h-40 mx-auto rounded-lg" />
                  <p className="text-xs text-text-tertiary mt-2">{image.name} · {image.w}×{image.h}</p>
                </div>
              ) : (
                <>
                  <div className="text-3xl mb-2 opacity-50">🖼</div>
                  <p className="text-text-tertiary text-sm">Drop an image or click to browse</p>
                </>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Background color to remove</span>
                {autoDetected && <span className="text-[10px] text-primary font-semibold">auto-detected</span>}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-lg border border-border shadow-inner shrink-0"
                  style={{ background: `rgb(${target.r},${target.g},${target.b})` }}
                />
                <span className="text-xs font-mono text-text-secondary">{`rgb(${target.r}, ${target.g}, ${target.b})`}</span>
                <button
                  onClick={() => setPickMode((p) => !p)}
                  className={`ml-auto px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                    pickMode ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:text-text'
                  }`}
                >
                  {pickMode ? 'Click preview…' : 'Pick from image'}
                </button>
              </div>

              <div>
                <label className="text-xs text-text-tertiary block mb-2">Tolerance: {tolerance}</label>
                <input type="range" min="0" max="100" value={tolerance} onChange={(e) => setTolerance(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Edge softness: {softness}</label>
                <input type="range" min="0" max="100" value={softness} onChange={(e) => setSoftness(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Edge feather: {feather} px</label>
                <input type="range" min="0" max="12" value={feather} onChange={(e) => setFeather(+e.target.value)} className="w-full accent-primary" />
              </div>
              <button
                onClick={process}
                disabled={!image}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                Remove Background
              </button>
              {status && <p className="text-xs text-text-tertiary text-center">{status}</p>}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-0">
              <canvas
                ref={displayRef}
                onClick={onPickClick}
                className={`w-full rounded-t-2xl ${pickMode ? 'cursor-crosshair ring-2 ring-primary ring-inset' : ''}`}
              />
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-text-tertiary">Preview (checkerboard = transparent)</span>
                <button
                  onClick={exportResult}
                  disabled={!resultUrl}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer"
                >
                  Download PNG
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Export background</span>
              <div className="flex flex-wrap gap-2 mb-4">
                {bgSwatches.map((s) => (
                  <button
                    key={s.v}
                    onClick={() => setExportBg(s.v)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      exportBg === s.v ? 'bg-primary-solid text-white border-primary-solid' : 'bg-surface text-text-secondary border-border hover:text-text'
                    }`}
                  >
                    {s.l}
                  </button>
                ))}
                {exportBg === 'custom' && (
                  <div className="flex items-center gap-2 w-full">
                    <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-border" />
                    <span className="text-xs font-mono text-text-secondary">{customColor}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div>• 100% in-browser — your image never leaves your device</div>
                <div>• Tip: raise tolerance to catch shadows, lower it for crisp product edges</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
