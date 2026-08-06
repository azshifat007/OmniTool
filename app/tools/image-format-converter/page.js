'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const FORMATS = [
  { ext: 'png', label: 'PNG', mime: 'image/png' },
  { ext: 'jpeg', label: 'JPEG', mime: 'image/jpeg' },
  { ext: 'webp', label: 'WebP', mime: 'image/webp' },
  { ext: 'avif', label: 'AVIF', mime: 'image/avif' },
];

const fmtBytes = (n) => {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function ImageFormatConverterPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [result, setResult] = useState(null);
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(85);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  const fmt = useMemo(() => FORMATS.find((f) => f.ext === format), [format]);

  const loadFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return;
    const url = URL.createObjectURL(f);
    setFile(f);
    setOriginalUrl(url);
    setResult(null);
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = url;
  }, []);

  const avifSupported = useMemo(() => {
    if (typeof document === 'undefined') return false;
    const c = document.createElement('canvas');
    return typeof c.toDataURL === 'function' && c.toDataURL('image/avif').startsWith('data:image/avif');
  }, []);

  const convert = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (fmt.mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL(fmt.mime, fmt.mime === 'image/png' ? undefined : quality / 100);
    const [head, body] = dataUrl.split(',');
    const mime = head.match(/:(.*?);/)[1];
    const bin = atob(body);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    setResult({ url: dataUrl, size: arr.length, mime });
    addEntry('Image Format Converter');
  }, [fmt, quality, addEntry]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${(file.name || 'image').replace(/\.[^.]+$/, '')}.${fmt.ext}`;
    a.click();
  }, [result, file, fmt]);

  const unsupported = fmt.ext === 'avif' && !avifSupported;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl text-cat-media">🔁</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Format Converter</h1>
      </div>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">
        Convert any image to PNG, JPEG, WebP or AVIF instantly in your browser. Nothing is uploaded.
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
                <span className="text-xs text-text-tertiary mb-2 block">Convert to</span>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.ext}
                      onClick={() => setFormat(f.ext)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        format === f.ext ? 'bg-primary-solid text-white border-primary-solid' : 'bg-surface text-text-secondary border-border hover:text-text'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {unsupported && (
                  <p className="text-[11px] text-accent mt-2">AVIF isn't supported in this browser — PNG, JPEG and WebP still work.</p>
                )}
              </div>
              {fmt.mime !== 'image/png' && (
                <div>
                  <label className="text-xs text-text-tertiary block mb-2">Quality: {quality}%</label>
                  <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full accent-primary" />
                </div>
              )}
              <button
                onClick={convert}
                disabled={!file || unsupported}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                Convert to {fmt.label}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">Converted result</span>
              {result ? (
                <>
                  <img src={result.url} alt="Converted" className="w-full rounded-xl" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-text-secondary">{fmtBytes(result.size)}</span>
                    <span className="text-[10px] font-mono uppercase text-text-tertiary">.{fmt.ext}</span>
                    {file && (
                      <span className={`text-[10px] font-mono ${result.size <= file.size ? 'text-cat-success' : 'text-accent'}`}>
                        {result.size <= file.size ? 'smaller' : 'larger'} than original
                      </span>
                    )}
                  </div>
                  <button
                    onClick={download}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer"
                  >
                    Download .{fmt.ext}
                  </button>
                </>
              ) : (
                <div className="text-center py-16 text-text-tertiary text-sm">
                  Pick a format and convert to see the result
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
