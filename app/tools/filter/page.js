'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const PRESETS = {
  None: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, invert: 0, opacity: 100, saturate: 100, sepia: 0 },
  Vintage: { blur: 0, brightness: 90, contrast: 85, grayscale: 15, hueRotate: 15, invert: 0, opacity: 100, saturate: 120, sepia: 40 },
  Cool: { blur: 0, brightness: 100, contrast: 110, grayscale: 0, hueRotate: 200, invert: 0, opacity: 100, saturate: 130, sepia: 0 },
  Warm: { blur: 0, brightness: 105, contrast: 95, grayscale: 0, hueRotate: 30, invert: 0, opacity: 100, saturate: 140, sepia: 10 },
  Dark: { blur: 0, brightness: 50, contrast: 120, grayscale: 20, hueRotate: 0, invert: 0, opacity: 100, saturate: 80, sepia: 0 },
  Retro: { blur: 0, brightness: 95, contrast: 90, grayscale: 5, hueRotate: 0, invert: 0, opacity: 100, saturate: 110, sepia: 60 },
};

const FILTERS = [
  { key: 'blur', label: 'Blur', unit: 'px', min: 0, max: 20, step: 0.5 },
  { key: 'brightness', label: 'Brightness', unit: '%', min: 0, max: 200, step: 1 },
  { key: 'contrast', label: 'Contrast', unit: '%', min: 0, max: 200, step: 1 },
  { key: 'grayscale', label: 'Grayscale', unit: '%', min: 0, max: 100, step: 1 },
  { key: 'hueRotate', label: 'Hue Rotate', unit: 'deg', min: 0, max: 360, step: 1 },
  { key: 'invert', label: 'Invert', unit: '%', min: 0, max: 100, step: 1 },
  { key: 'opacity', label: 'Opacity', unit: '%', min: 0, max: 100, step: 1 },
  { key: 'saturate', label: 'Saturate', unit: '%', min: 0, max: 200, step: 1 },
  { key: 'sepia', label: 'Sepia', unit: '%', min: 0, max: 100, step: 1 },
];

export default function FilterPage() {
  const { addEntry } = useHistory();
  const [filters, setFilters] = useState({ blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, invert: 0, opacity: 100, saturate: 100, sepia: 0 });

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((name) => {
    setFilters({ ...PRESETS[name] });
    addEntry('CSS Filter Generator');
  }, [addEntry]);

  const cssFilter = [
    filters.blur > 0 && `blur(${filters.blur}px)`,
    filters.brightness !== 100 && `brightness(${filters.brightness}%)`,
    filters.contrast !== 100 && `contrast(${filters.contrast}%)`,
    filters.grayscale > 0 && `grayscale(${filters.grayscale}%)`,
    filters.hueRotate > 0 && `hue-rotate(${filters.hueRotate}deg)`,
    filters.invert > 0 && `invert(${filters.invert}%)`,
    filters.opacity !== 100 && `opacity(${filters.opacity}%)`,
    filters.saturate !== 100 && `saturate(${filters.saturate}%)`,
    filters.sepia > 0 && `sepia(${filters.sepia}%)`,
  ].filter(Boolean).join(' ') || 'none';

  const cssCode = `filter: ${cssFilter};`;

  const previewStyle = {
    filter: cssFilter,
    background: 'linear-gradient(135deg, #6C5CE7, #48dbfb)',
    borderRadius: '12px',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Filter Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESETS).map((name) => (
                  <button key={name} onClick={() => applyPreset(name)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer"
                  >{name}</button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 space-y-4">
              {FILTERS.map(({ key, label, unit, min, max, step }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-text-tertiary">{label}</label>
                    <span className="text-xs font-mono text-text-secondary">{filters[key]}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={filters[key]}
                    onChange={(e) => setFilter(key, parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
              <div className="w-full h-48 rounded-xl border border-border flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center" style={previewStyle}>
                  <span className="text-white text-4xl font-bold opacity-50" style={{ filter: 'none' }}>◑</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">CSS Code</span>
                <CopyButton text={cssCode} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre">{cssCode}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
