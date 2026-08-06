'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
const hslRegex = /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  if (h.length === 3) return { r: parseInt(h[0] + h[0], 16), g: parseInt(h[1] + h[1], 16), b: parseInt(h[2] + h[2], 16) };
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

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

function rgbToCmyk(r, g, b) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round((1 - rr - k) / (1 - k) * 100),
    m: Math.round((1 - gg - k) / (1 - k) * 100),
    y: Math.round((1 - bb - k) / (1 - k) * 100),
    k: Math.round(k * 100),
  };
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

function parseColor(trimmed) {
  let r, g, b;
  if (hexRegex.test(trimmed)) {
    const rgb = hexToRgb(trimmed);
    r = rgb.r; g = rgb.g; b = rgb.b;
  } else if (rgbRegex.test(trimmed)) {
    const m = trimmed.match(rgbRegex);
    r = parseInt(m[1]); g = parseInt(m[2]); b = parseInt(m[3]);
  } else if (hslRegex.test(trimmed)) {
    const m = trimmed.match(hslRegex);
    const rgb = hslToRgb(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
    r = rgb.r; g = rgb.g; b = rgb.b;
  } else {
    return null;
  }
  if ([r, g, b].some(v => v < 0 || v > 255)) return null;
  return { r, g, b };
}

export default function ColorPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('#ff0066');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = useCallback((val) => {
    setError('');
    const trimmed = val.trim();
    if (!trimmed) { setResults(null); return; }
    try {
      const parsed = parseColor(trimmed);
      if (!parsed) { setError('Invalid color format. Use Hex, RGB, or HSL.'); setResults(null); return; }
      const { r, g, b } = parsed;
      const hsl = rgbToHsl(r, g, b);
      const cmyk = rgbToCmyk(r, g, b);
      setResults({
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
        r, g, b,
      });
      addEntry('Color Converter');
    } catch (e) {
      setError(e.message); setResults(null);
    }
  }, [addEntry]);

  const onChange = useCallback((e) => {
    const val = e.target.value;
    setInput(val);
    handleConvert(val);
  }, [handleConvert]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Color Value (Hex, RGB, or HSL)</label>
            <div className="flex gap-2">
              <input value={input} onChange={onChange} placeholder="#ff0066 or rgb(255,0,102) or hsl(336,100%,50%)"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <input type="color" value={results ? results.hex : '#ff0066'} onChange={(e) => { setInput(e.target.value); handleConvert(e.target.value); }}
              className="w-full mt-3 h-10 rounded-lg border border-border cursor-pointer" />
          </div>
        </GlassCard>

        {results && (
          <GlassCard>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-border" style={{ background: results.hex }} />
                <span className="text-xs text-text-tertiary">Live Preview</span>
                <button onClick={() => navigator.clipboard.writeText([results.hex, results.rgb, results.hsl, results.cmyk].join('\n'))}
                  className="ml-auto text-[10px] text-text-secondary hover:text-primary cursor-pointer">Copy All</button>
              </div>
              {[
                { label: 'HEX', value: results.hex },
                { label: 'RGB', value: results.rgb },
                { label: 'HSL', value: results.hsl },
                { label: 'CMYK', value: results.cmyk },
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
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
