'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const schemes = [
  { value: 'monochromatic', label: 'Monochromatic' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'tetradic', label: 'Tetradic' },
];

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
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

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function generatePalette(seed, scheme) {
  const hsl = hexToHsl(seed);
  let colors = [];

  switch (scheme) {
    case 'monochromatic':
      for (let i = 0; i < 5; i++) {
        colors.push(hslToHex(hsl.h, hsl.s, 20 + i * 15));
      }
      break;
    case 'complementary': {
      const comp = (hsl.h + 180) % 360;
      colors = [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(comp, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90)),
        hslToHex(comp, hsl.s, Math.min(hsl.l + 20, 90)),
        hslToHex(hsl.h, Math.max(hsl.s - 20, 0), Math.max(hsl.l - 15, 10)),
      ];
      break;
    }
    case 'analogous': {
      const a1 = (hsl.h - 30 + 360) % 360;
      const a2 = (hsl.h + 30) % 360;
      colors = [
        hslToHex(a1, hsl.s, hsl.l),
        hslToHex(a1, hsl.s, Math.min(hsl.l + 15, 85)),
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(a2, hsl.s, Math.min(hsl.l + 15, 85)),
        hslToHex(a2, hsl.s, hsl.l),
      ];
      break;
    }
    case 'triadic': {
      const t1 = (hsl.h + 120) % 360;
      const t2 = (hsl.h + 240) % 360;
      colors = [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(t1, hsl.s, hsl.l),
        hslToHex(t2, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 15, 85)),
        hslToHex(t1, hsl.s, Math.max(hsl.l - 10, 10)),
      ];
      break;
    }
    case 'tetradic': {
      const t1 = (hsl.h + 90) % 360;
      const t2 = (hsl.h + 180) % 360;
      const t3 = (hsl.h + 270) % 360;
      colors = [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex(t1, hsl.s, hsl.l),
        hslToHex(t2, hsl.s, hsl.l),
        hslToHex(t3, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 85)),
      ];
      break;
    }
  }
  return colors;
}

export default function PalettePage() {
  const { addEntry } = useHistory();
  const [seed, setSeed] = useState('#6C5CE7');
  const [scheme, setScheme] = useState('monochromatic');
  const [palette, setPalette] = useState(null);

  const handleGenerate = useCallback(() => {
    const colors = generatePalette(seed, scheme);
    setPalette(colors);
    addEntry('Color Palette Generator');
  }, [seed, scheme, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">🎨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Palette Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Seed Color</label>
              <div className="flex gap-2">
                <input type="color" value={seed} onChange={(e) => setSeed(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                <input value={seed} onChange={(e) => setSeed(e.target.value)}
                  placeholder="#6C5CE7"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Palette Type</label>
              <select value={scheme} onChange={(e) => setScheme(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {schemes.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button onClick={handleGenerate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Generate
            </button>
          </div>
        </GlassCard>

        {palette && (
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">Generated Palette</span>
              <div className="grid grid-cols-5 gap-2">
                {palette.map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-xl border border-border" style={{ background: color }} />
                    <span className="text-xs font-mono text-text">{color}</span>
                    <CopyButton text={color} />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
