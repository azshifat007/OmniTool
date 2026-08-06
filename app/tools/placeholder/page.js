'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const presets = [
  { label: 'Thumbnail', w: 150, h: 150 },
  { label: 'Medium', w: 300, h: 250 },
  { label: 'Standard', w: 640, h: 480 },
  { label: 'HD', w: 1920, h: 1080 },
];

function generateSvgDataUri(w, h, bgColor, textColor, text) {
  const safeText = text || `${w}×${h}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
    font-family="system-ui, sans-serif" font-size="${Math.max(12, Math.min(w, h) * 0.08)}px"
    fill="${textColor}">${safeText}</text>
</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export default function PlaceholderPage() {
  const { addEntry } = useHistory();
  const [width, setWidth] = useState('640');
  const [height, setHeight] = useState('480');
  const [bgColor, setBgColor] = useState('#CCCCCC');
  const [textColor, setTextColor] = useState('#333333');
  const [text, setText] = useState('');
  const [dataUri, setDataUri] = useState('');
  const [dimensions, setDimensions] = useState('');

  const generate = useCallback(() => {
    const w = parseInt(width, 10) || 100;
    const h = parseInt(height, 10) || 100;
    const uri = generateSvgDataUri(w, h, bgColor, textColor, text);
    setDataUri(uri);
    setDimensions(`${w}×${h}`);
    addEntry('Image Placeholder Generator');
  }, [width, height, bgColor, textColor, text, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">🖼</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Placeholder Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Width (px)</label>
                  <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} min="1"
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Height (px)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min="1"
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Background</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent shrink-0" />
                    <input value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent shrink-0" />
                    <input value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Text (optional)</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. WxH"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>

              <button onClick={generate} className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preset Sizes</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.label} onClick={() => { setWidth(String(p.w)); setHeight(String(p.h)); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-tertiary hover:text-text border border-border hover:border-primary/40 transition-all cursor-pointer"
                  >{p.label} ({p.w}×{p.h})</button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          {dataUri && (
            <>
              <GlassCard>
                <div className="p-4">
                  <label className="text-xs text-text-tertiary mb-3 block">Preview — {dimensions}</label>
                  <div className="w-full flex items-center justify-center bg-surface rounded-xl border border-border/50 p-4">
                    <img src={dataUri} alt={`Placeholder ${dimensions}`}
                      className="max-w-full h-auto rounded-lg shadow-sm" style={{ maxHeight: '300px' }} />
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-tertiary">Data URI</span>
                    <CopyButton text={dataUri} />
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-border/50 max-h-32 overflow-auto">
                    <code className="text-xs font-mono text-text break-all whitespace-pre-wrap">{dataUri}</code>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
