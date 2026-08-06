'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const presets = [
  { label: 'Square', values: { tl: 0, tr: 0, br: 0, bl: 0 } },
  { label: 'Rounded', values: { tl: 8, tr: 8, br: 8, bl: 8 } },
  { label: 'Pill', values: { tl: 9999, tr: 9999, br: 9999, bl: 9999 } },
  { label: 'Circle', values: { tl: 50, tr: 50, br: 50, bl: 50 } },
];

export default function RadiusPage() {
  const { addEntry } = useHistory();
  const [corners, setCorners] = useState({ tl: 0, tr: 0, br: 0, bl: 0 });
  const [uniform, setUniform] = useState(true);

  const updateCorner = useCallback((key, val) => {
    const v = Math.max(0, Math.min(9999, parseInt(val) || 0));
    if (uniform) {
      setCorners({ tl: v, tr: v, br: v, bl: v });
    } else {
      setCorners((c) => ({ ...c, [key]: v }));
    }
  }, [uniform]);

  const handlePreset = useCallback((p) => {
    setCorners(p.values);
    addEntry('Border Radius Generator');
  }, [addEntry]);

  const css = `border-radius: ${corners.tl}px ${corners.tr}px ${corners.br}px ${corners.bl}px;`;
  const previewStyle = {
    borderRadius: `${corners.tl}px ${corners.tr}px ${corners.br}px ${corners.bl}px`,
    width: '100%',
    height: '200px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
  };

  const sliders = [
    { key: 'tl', label: 'Top-Left' },
    { key: 'tr', label: 'Top-Right' },
    { key: 'br', label: 'Bottom-Right' },
    { key: 'bl', label: 'Bottom-Left' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◻</span>
        <h1 className="font-heading text-2xl font-bold text-text">Border Radius Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => handlePreset(p)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer"
                >{p.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
              <input type="checkbox" checked={uniform} onChange={() => setUniform(!uniform)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer" />
              Uniform
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {sliders.map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-text-tertiary">{label}</span>
                  <span className="text-xs font-mono text-text">{corners[key]}px</span>
                </div>
                <input type="range" min={0} max={200} value={corners[key]}
                  onChange={(e) => updateCorner(key, e.target.value)}
                  className="w-full accent-primary" />
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div style={previewStyle} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-tertiary">CSS Output</span>
            <CopyButton text={css} />
          </div>
          <div className="bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text break-all border border-border/50">
            {css}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
