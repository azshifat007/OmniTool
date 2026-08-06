'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyRatio(w, h) {
  const g = gcd(w, h);
  return { w: w / g, h: h / g };
}

function calcAspectRatio(w, h) {
  const s = simplifyRatio(w, h);
  return s;
}

function calcMegapixels(w, h) {
  return (w * h) / 1000000;
}

function calcPPI(w, h, diag) {
  if (!diag || diag <= 0) return null;
  const ppi = Math.sqrt(w * w + h * h) / diag;
  return ppi;
}

function calcPitch(ppi) {
  if (!ppi || ppi <= 0) return null;
  return 25.4 / ppi;
}

export default function ResolutionPage() {
  const { addEntry } = useHistory();
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [diagonal, setDiagonal] = useState('');

  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  const d = parseFloat(diagonal);

  const valid = !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
  const ratio = valid ? calcAspectRatio(w, h) : null;
  const mp = valid ? calcMegapixels(w, h) : null;
  const ppi = valid ? calcPPI(w, h, d) : null;
  const pitch = ppi ? calcPitch(ppi) : null;

  const commonResolutions = [
    ['SVGA', 800, 600],
    ['HD', 1280, 720],
    ['HD+', 1600, 900],
    ['FHD', 1920, 1080],
    ['QHD', 2560, 1440],
    ['4K UHD', 3840, 2160],
    ['5K', 5120, 2880],
    ['8K UHD', 7680, 4320],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">□</span>
        <h1 className="font-heading text-2xl font-bold text-text">Resolution Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} min={1}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min={1}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Diagonal (in)</label>
                <input type="number" value={diagonal} onChange={(e) => setDiagonal(e.target.value)} min={0} step="0.1" placeholder="Optional"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            {valid && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-[10px] text-text-tertiary mb-1">Aspect Ratio</div>
                  <div className="text-lg font-mono font-bold text-text">
                    {ratio.w}:{ratio.h}
                  </div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-[10px] text-text-tertiary mb-1">Megapixels</div>
                  <div className="text-lg font-mono font-bold text-text">{mp.toFixed(2)} MP</div>
                </div>
                {ppi !== null && (
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <div className="text-[10px] text-text-tertiary mb-1">PPI</div>
                    <div className="text-lg font-mono font-bold text-text">{ppi.toFixed(1)}</div>
                  </div>
                )}
                {pitch !== null && (
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <div className="text-[10px] text-text-tertiary mb-1">Pixel Pitch</div>
                    <div className="text-lg font-mono font-bold text-text">{pitch.toFixed(3)} mm</div>
                  </div>
                )}
              </div>
            )}

            {valid && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] text-text-tertiary">Total pixels:</span>
                <span className="text-[10px] font-mono text-text-secondary">{(w * h).toLocaleString()}</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Common Resolutions</span>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {commonResolutions.map(([name, cw, ch]) => {
                const r = simplifyRatio(cw, ch);
                return (
                  <button key={name} onClick={() => { setWidth(String(cw)); setHeight(String(ch)); }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer group border border-transparent hover:border-border">
                    <span className="text-sm text-text">{name}</span>
                    <span className="text-[11px] text-text-secondary font-mono group-hover:text-primary transition-colors">
                      {cw}×{ch} · {r.w}:{r.h}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      {valid && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Aspect Ratio Variants</span>
            <div className="flex flex-wrap gap-2">
              {[
                `${ratio.w}:${ratio.h}`,
                `${(w / h).toFixed(3)}:1`,
                `1:${(h / w).toFixed(3)}`,
                `${ratio.w}/${ratio.h}`,
              ].map((v) => (
                <span key={v} className="text-xs font-mono text-text-secondary bg-surface rounded-lg px-3 py-1.5 border border-border">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
