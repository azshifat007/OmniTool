'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';
import { downloadBlob, downloadZip } from '@/lib/zip';

const SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];
const ZIP_SIZES = [16, 32, 48, 64, 128, 180, 192, 256, 512];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'favicon';
}

function renderFavicon(size, img, bgColor, padding, shape) {
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
  return canvas;
}

function pngBytes(canvas) {
  const b64 = canvas.toDataURL('image/png').split(',')[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function buildIco(canvases) {
  const pngs = canvases.map((c) => ({ size: c.width, data: pngBytes(c) }));
  const header = 6 + pngs.length * 16;
  const total = header + pngs.reduce((a, p) => a + p.data.length, 0);
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, 0, true);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, pngs.length, true);
  let offset = header;
  pngs.forEach((p, i) => {
    const e = 6 + i * 16;
    dv.setUint8(e, p.size >= 256 ? 0 : p.size);
    dv.setUint8(e + 1, p.size >= 256 ? 0 : p.size);
    dv.setUint16(e + 6, 32, true);
    dv.setUint32(e + 8, p.data.length, true);
    dv.setUint32(e + 12, offset, true);
    out.set(p.data, offset);
    offset += p.data.length;
  });
  return out;
}

function buildManifest(siteName, bgColor) {
  const name = siteName.trim() || 'My Site';
  return JSON.stringify(
    {
      name,
      short_name: name.slice(0, 12),
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: bgColor,
      background_color: bgColor,
      display: 'standalone',
    },
    null,
    2
  );
}

export default function FaviconGenPage() {
  const { addEntry } = useHistory();
  const [image, setImage] = useState(null);
  const [previews, setPreviews] = useState({});
  const [bgColor, setBgColor] = useState('#ffffff');
  const [padding, setPadding] = useState(10);
  const [shape, setShape] = useState('square');
  const [siteName, setSiteName] = useState('My Site');
  const fileRef = useRef(null);

  useEffect(() => {
    if (image) {
      const results = {};
      for (const size of SIZES) {
        results[size] = renderFavicon(size, image, bgColor, padding, shape).toDataURL('image/png');
      }
      setPreviews(results);
    }
  }, [image, bgColor, padding, shape]);

  const onLoad = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const downloadFavicon = useCallback((size) => {
    if (!image) return;
    const canvas = renderFavicon(size, image, bgColor, padding, shape);
    canvas.toBlob((blob) => {
      downloadBlob(blob, `favicon-${size}x${size}.png`);
    }, 'image/png');
    addEntry('Favicon Generator');
  }, [image, bgColor, padding, shape, addEntry]);

  const downloadIco = useCallback(() => {
    if (!image) return;
    const canvases = [16, 32, 48].map((size) => renderFavicon(size, image, bgColor, padding, shape));
    downloadBlob(new Blob([buildIco(canvases)], { type: 'image/x-icon' }), 'favicon.ico');
    addEntry('Favicon Generator');
  }, [image, bgColor, padding, shape, addEntry]);

  const downloadAll = useCallback(() => {
    if (!image) return;
    const base = slugify(siteName);
    const ico = buildIco([16, 32, 48].map((size) => renderFavicon(size, image, bgColor, padding, shape)));
    const files = [
      { name: 'favicon.ico', data: ico },
    ];
    for (const size of ZIP_SIZES) {
      const name =
        size === 180 ? 'apple-touch-icon.png'
        : size === 192 ? 'android-chrome-192x192.png'
        : size === 512 ? 'android-chrome-512x512.png'
        : `favicon-${size}x${size}.png`;
      files.push({ name, data: pngBytes(renderFavicon(size, image, bgColor, padding, shape)) });
    }
    files.push({ name: 'site.webmanifest', data: new TextEncoder().encode(buildManifest(siteName, bgColor)) });
    downloadZip(`${base}-favicons.zip`, files);
    addEntry('Favicon Generator');
  }, [image, bgColor, padding, shape, siteName, addEntry]);

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
                <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files[0] && onLoad(e.target.files[0])} className="hidden" />
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
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Site name (for manifest & zip)</label>
                <input value={siteName} onChange={e => setSiteName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none" />
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs text-text-tertiary font-semibold">Generated Favicons</span>
              {image && (
                <div className="flex gap-2">
                  <button onClick={downloadIco}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                    Download .ico
                  </button>
                  <button onClick={downloadAll}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                    Download all (.zip)
                  </button>
                </div>
              )}
            </div>
            {Object.keys(previews).length > 0 ? (
              <>
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
                <p className="text-[11px] text-text-tertiary mt-4 leading-relaxed">
                  The zip includes favicon.ico (16/32/48), PNGs for every size, apple-touch-icon, android-chrome icons and a site.webmanifest.
                </p>
              </>
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
