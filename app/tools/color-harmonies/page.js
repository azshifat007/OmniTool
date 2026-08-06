'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (mx === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r, g, b;
  if (h < 60) [r,g,b] = [c,x,0];
  else if (h < 120) [r,g,b] = [x,c,0];
  else if (h < 180) [r,g,b] = [0,c,x];
  else if (h < 240) [r,g,b] = [0,x,c];
  else if (h < 300) [r,g,b] = [x,0,c];
  else [r,g,b] = [c,0,x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

function harmonies(h, s, l) {
  const m = (v) => ((v % 360) + 360) % 360;
  return {
    Complementary: [m(h + 180)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    Triadic: [m(h + 120), m(h + 240)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    'Split-Complementary': [m(h + 150), m(h + 210)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    Tetradic: [m(h + 0), m(h + 60), m(h + 180), m(h + 240)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    Square: [m(h + 0), m(h + 90), m(h + 180), m(h + 270)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    Analogous: [m(h - 30), m(h), m(h + 30)].map(hh => rgbToHex(...hslToRgb(hh, s, l))),
    Monochromatic: [20, 40, 60, 80].map(ll => rgbToHex(...hslToRgb(h, s, ll))),
  };
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

function Swatch({ hex }) {
  return (
    <button onClick={() => copy(hex)} title="Click to copy hex" className="group relative w-full aspect-square rounded-xl border border-border overflow-hidden cursor-pointer transition-transform hover:scale-105">
      <div className="w-full h-full" style={{ backgroundColor: hex }} />
      <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-black/60 text-[10px] text-white font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity">{hex}</div>
    </button>
  );
}

export default function ColorHarmoniesPage() {
  const [color, setColor] = useState('#6366f1');
  const rgb = useMemo(() => hexToRgb(color), [color]);
  const hsl = useMemo(() => rgbToHsl(...rgb), [rgb]);
  const h = useMemo(() => harmonies(...hsl), [hsl]);
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    const text = Object.entries(h).map(([name, colors]) => `${name}: ${colors.join(', ')}`).join('\n');
    await copy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Harmonies</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-xl border border-border cursor-pointer" />
            <input type="text" value={color} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setColor(e.target.value); }}
              className="bg-surface text-text rounded-lg border border-border px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 w-28" />
            <span className="text-xs text-text-tertiary">HSL ({hsl[0]}°, {hsl[1]}%, {hsl[2]}%)</span>
          </div>
          <div className="space-y-5">
            {Object.entries(h).map(([name, colors]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">{name}</span>
                  <span className="text-[11px] text-text-tertiary">{colors.length} colors</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {colors.map(hex => <Swatch key={hex} hex={hex} />)}
                </div>
              </div>
            ))}
          </div>
          <button onClick={copyAll}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
            {copied ? 'Copied!' : 'Copy All Colors'}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
