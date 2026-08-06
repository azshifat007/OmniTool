'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const fmtBytes = (n) => {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function ImageCompressorPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const [maxDim, setMaxDim] = useState(0);
  const [dims, setDims] = useState(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  const loadFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return;
    const url = URL.createObjectURL(f);
    setFile(f);
    setOriginalUrl(url);
    setCompressedUrl('');
    setCompressedSize(0);
    const img = new Image();
    img.onload = () => {
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      imgRef.current = img;
    };
    img.src = url;
  }, []);

  const compress = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (maxDim > 0) {
      const scale = Math.min(1, maxDim / Math.max(w, h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const dataUrl = canvas.toDataURL(mime, quality / 100);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    const blob = dataURLtoBlob(dataUrl);
    setCompressedUrl(dataUrl);
    setCompressedSize(blob.size);
    addEntry('Image Compressor');
  }, [format, quality, maxDim, compressedUrl, addEntry]);

  const dataURLtoBlob = useCallback((dataUrl) => {
    const [head, body] = dataUrl.split(',');
    const mime = head.match(/:(.*?);/)[1];
    const bin = atob(body);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }, []);

  const savings = useMemo(() => {
    if (!file || !compressedSize) return null;
    return Math.round((1 - compressedSize / file.size) * 100);
  }, [file, compressedSize]);

  const download = useCallback(() => {
    if (!compressedUrl) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `${(file.name || 'image').replace(/\.[^.]+$/, '')}-compressed.${format}`;
    a.click();
  }, [compressedUrl, file, format]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl text-cat-media">🗜️</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Compressor</h1>
      </div>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">
        Shrink image file size as JPEG or WebP with a quality slider and optional resize — 100% in your browser.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadFile(e.target.files[0])} />
              {file ? (
                <div>
                  <img src={originalUrl} alt="Source" className="max-h-40 mx-auto rounded-lg" />
                  <p className="text-xs text-text-tertiary mt-2">{file.name} · {fmtBytes(file.size)}</p>
                  {dims && <p className="text-[10px] text-text-tertiary">{dims.w}×{dims.h}</p>}
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
              <div>
                <span className="text-xs text-text-tertiary mb-2 block">Output format</span>
                <div className="flex gap-2">
                  {[{ v: 'webp', l: 'WebP' }, { v: 'jpeg', l: 'JPEG' }].map((f) => (
                    <button
                      key={f.v}
                      onClick={() => setFormat(f.v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        format === f.v ? 'bg-primary-solid text-white border-primary-solid' : 'bg-surface text-text-secondary border-border hover:text-text'
                      }`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Quality: {quality}%</label>
                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <span className="text-xs text-text-tertiary mb-2 block">Max dimension</span>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: 0, l: 'Original' }, { v: 2560, l: '2560 px' }, { v: 1920, l: '1920 px' }, { v: 1280, l: '1280 px' }, { v: 640, l: '640 px' }].map((d) => (
                    <button
                      key={d.v}
                      onClick={() => setMaxDim(d.v)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        maxDim === d.v ? 'bg-primary-solid text-white border-primary-solid' : 'bg-surface text-text-secondary border-border hover:text-text'
                      }`}
                    >
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={compress}
                disabled={!file}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                Compress Image
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">Compressed result</span>
              {compressedUrl ? (
                <>
                  <img src={compressedUrl} alt="Compressed" className="w-full rounded-xl" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-text-secondary">{fmtBytes(compressedSize)}</span>
                    {savings !== null && savings >= 0 && (
                      <span className="text-[10px] font-mono text-cat-success">−{savings}% vs original ({fmtBytes(file.size)})</span>
                    )}
                    {savings !== null && savings < 0 && (
                      <span className="text-[10px] font-mono text-accent">+{Math.abs(savings)}% larger — try a lower quality</span>
                    )}
                  </div>
                  <button
                    onClick={download}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer"
                  >
                    Download .{format}
                  </button>
                </>
              ) : (
                <div className="text-center py-16 text-text-tertiary text-sm">
                  Upload an image and hit Compress to see the result
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
