'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(fg, bg) {
  const l1 = luminance(...fg);
  const l2 = luminance(...bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function passAA(ratio, large) { return large ? ratio >= 3 : ratio >= 4.5; }
function passAAA(ratio, large) { return large ? ratio >= 4.5 : ratio >= 7; }

export default function ContrastPage() {
  const [fg, setFg] = useState('#1a1a2e');
  const [bg, setBg] = useState('#f0f0f0');
  const [fgRgb, bgRgb] = useMemo(() => [hexToRgb(fg), hexToRgb(bg)], [fg, bg]);
  const [size, setSize] = useState(24);
  const ratio = useMemo(() => {
    try { return contrast(fgRgb, bgRgb); } catch { return 0; }
  }, [fgRgb, bgRgb]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Contrast Checker</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input type="text" value={fg} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setFg(e.target.value); }}
                  className="flex-1 bg-surface text-text rounded-lg border border-border px-3 py-1.5 text-sm font-mono outline-none focus:border-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input type="text" value={bg} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setBg(e.target.value); }}
                  className="flex-1 bg-surface text-text rounded-lg border border-border px-3 py-1.5 text-sm font-mono outline-none focus:border-primary/50" />
              </div>
            </div>
          </div>
          <div className="text-center py-4 rounded-xl" style={{ backgroundColor: bg, color: fg }}>
            <div className="text-sm mb-1" style={{ fontSize: `${Math.max(size - 8, 12)}px` }}>Small text sample</div>
            <div style={{ fontSize: `${size}px`, fontWeight: 700 }}>Large text sample</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-text tabular-nums">{ratio.toFixed(2)}<span className="text-base font-normal text-text-tertiary">:1</span></div>
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Preview font size: {size}px</label>
            <input type="range" min={12} max={48} value={size} onChange={e => setSize(parseInt(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'AA Normal', pass: ratio >= 4.5 },
              { label: 'AA Large', pass: ratio >= 3 },
              { label: 'AAA Normal', pass: ratio >= 7 },
              { label: 'AAA Large', pass: ratio >= 4.5 },
            ].map(({ label, pass }) => (
              <div key={label} className={`px-3 py-2 rounded-lg border text-center ${pass ? 'bg-cat-success/10 text-cat-success border-cat-success/20' : 'bg-cat-text/10 text-cat-text border-cat-text/20'}`}>
                <div className="font-semibold">{pass ? 'PASS' : 'FAIL'}</div>
                <div className="text-xs opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
