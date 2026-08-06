'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ratios = [
  { value: 1.125, label: '1.125 — Minor Second' },
  { value: 1.25, label: '1.25 — Major Second' },
  { value: 1.333, label: '1.333 — Minor Third' },
  { value: 1.5, label: '1.5 — Perfect Fourth' },
  { value: 1.618, label: '1.618 — Golden Ratio' },
  { value: 2, label: '2 — Octave' },
];

const scaleNames = [
  { key: 'h1', label: 'h1' },
  { key: 'h2', label: 'h2' },
  { key: 'h3', label: 'h3' },
  { key: 'h4', label: 'h4' },
  { key: 'body', label: 'body' },
  { key: 'small', label: 'small' },
];

function generateScale(base, ratio) {
  const sizes = {};
  scaleNames.forEach(({ key }, i) => {
    const step = 2 - i;
    sizes[key] = Math.round(base * Math.pow(ratio, step) * 100) / 100;
  });
  return sizes;
}

export default function TypographyPage() {
  const { addEntry } = useHistory();
  const [ratio, setRatio] = useState(1.333);
  const [base, setBase] = useState(16);

  const scale = generateScale(base, ratio);

  const cssCode = `:root {\n  --font-body: 'DM Sans', sans-serif;\n  --font-heading: 'Plus Jakarta Sans', sans-serif;\n${scaleNames.map(({ key }) => {
    const size = scale[key];
    const rem = size / 16;
    if (key === 'body') return `  --fs-${key}: ${rem}rem;`;
    if (key === 'small') return `  --fs-${key}: ${rem}rem;`;
    return `  --fs-${key}: ${rem}rem;`;
  }).join('\n')}\n}\n\n${scaleNames.map(({ key }) => {
    const size = scale[key];
    const rem = size / 16;
    if (key === 'body') return `body { font-size: ${rem}rem; }`;
    if (key === 'small') return `.small { font-size: ${rem}rem; }`;
    return `${key} { font-size: ${rem}rem; }`;
  }).join('\n')}`;

  const handleGenerate = useCallback(() => {
    addEntry('Typography Scale Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">🔤</span>
        <h1 className="font-heading text-2xl font-bold text-text">Typography Scale Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Scale Ratio</label>
                <select value={ratio} onChange={(e) => { setRatio(parseFloat(e.target.value)); handleGenerate(); }}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {ratios.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-text-tertiary">Base Size: {base}px</label>
                </div>
                <input type="range" min={12} max={24} step={1} value={base}
                  onChange={(e) => setBase(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
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

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
            <div className="overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-text-tertiary">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Size</th>
                    <th className="pb-2">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {scaleNames.map(({ key, label }) => {
                    const size = scale[key];
                    const rem = size / 16;
                    const isBody = key === 'body';
                    const isSmall = key === 'small';
                    const tag = isBody ? 'p' : isSmall ? 'p' : key;
                    const style = { fontSize: `${rem}rem`, fontFamily: isBody || isSmall ? 'var(--font-body)' : 'var(--font-heading)', fontWeight: isBody ? 400 : 700 };
                    return (
                      <tr key={key} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-xs text-text-secondary">{label}</td>
                        <td className="py-3 pr-4 text-xs font-mono text-text-tertiary whitespace-nowrap">{size}px / {rem.toFixed(3)}rem</td>
                        <td className="py-3">
                          <span style={style} className="text-text block truncate max-w-[200px]">
                            {isBody ? 'The quick brown fox jumps over the lazy dog.' : isSmall ? 'The quick brown fox jumps over the lazy dog.' : `Heading ${label.toUpperCase()}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
