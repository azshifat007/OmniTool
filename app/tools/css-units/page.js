'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const units = [
  { id: 'px', label: 'px', group: 'Absolute' },
  { id: 'pt', label: 'pt', group: 'Absolute' },
  { id: 'pc', label: 'pc', group: 'Absolute' },
  { id: 'in', label: 'in', group: 'Absolute' },
  { id: 'cm', label: 'cm', group: 'Absolute' },
  { id: 'mm', label: 'mm', group: 'Absolute' },
  { id: 'em', label: 'em', group: 'Relative' },
  { id: 'rem', label: 'rem', group: 'Relative' },
  { id: '%', label: '%', group: 'Relative' },
  { id: 'vw', label: 'vw', group: 'Viewport' },
  { id: 'vh', label: 'vh', group: 'Viewport' },
  { id: 'vmin', label: 'vmin', group: 'Viewport' },
  { id: 'vmax', label: 'vmax', group: 'Viewport' },
  { id: 'ch', label: 'ch', group: 'Relative' },
  { id: 'ex', label: 'ex', group: 'Relative' },
];

const unitGroups = [...new Set(units.map((u) => u.group))];
const pxPerMm = 3.7795275591;

function toPx(value, unit, base) {
  switch (unit) {
    case 'px': return value;
    case 'pt': return value * 1.333333;
    case 'pc': return value * 16;
    case 'in': return value * 96;
    case 'cm': return value * pxPerMm * 10;
    case 'mm': return value * pxPerMm;
    case 'em': return value * base.fontSize;
    case 'rem': return value * base.fontSize;
    case '%': return value * base.parentWidth / 100;
    case 'vw': return value * base.viewportWidth / 100;
    case 'vh': return value * base.viewportHeight / 100;
    case 'vmin': return value * Math.min(base.viewportWidth, base.viewportHeight) / 100;
    case 'vmax': return value * Math.max(base.viewportWidth, base.viewportHeight) / 100;
    case 'ch': return value * base.fontSize * 0.6;
    case 'ex': return value * base.fontSize * 0.5;
    default: return value;
  }
}

function fromPx(px, unit, base) {
  switch (unit) {
    case 'px': return px;
    case 'pt': return px / 1.333333;
    case 'pc': return px / 16;
    case 'in': return px / 96;
    case 'cm': return px / (pxPerMm * 10);
    case 'mm': return px / pxPerMm;
    case 'em': return px / base.fontSize;
    case 'rem': return px / base.fontSize;
    case '%': return px * 100 / base.parentWidth;
    case 'vw': return px * 100 / base.viewportWidth;
    case 'vh': return px * 100 / base.viewportHeight;
    case 'vmin': return px * 100 / Math.min(base.viewportWidth, base.viewportHeight);
    case 'vmax': return px * 100 / Math.max(base.viewportWidth, base.viewportHeight);
    case 'ch': return px / (base.fontSize * 0.6);
    case 'ex': return px / (base.fontSize * 0.5);
    default: return px;
  }
}

export default function CssUnitsPage() {
  const { addEntry } = useHistory();
  const [value, setValue] = useState('16');
  const [fromUnit, setFromUnit] = useState('px');
  const [toUnit, setToUnit] = useState('em');
  const [base, setBase] = useState({ fontSize: 16, viewportWidth: 1920, viewportHeight: 1080, parentWidth: 800 });
  const [showBase, setShowBase] = useState(false);

  const num = parseFloat(value);
  const px = isNaN(num) ? null : toPx(num, fromUnit, base);
  const result = px !== null ? fromPx(px, toUnit, base) : null;

  const handleBase = (key, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setBase((prev) => ({ ...prev, [key]: n }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⌗</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Units Converter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">From</label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {unitGroups.map((g) => (
                  <optgroup key={g} label={g}>
                    {units.filter((u) => u.group === g).map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">To</label>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {unitGroups.map((g) => (
                  <optgroup key={g} label={g}>
                    {units.filter((u) => u.group === g).map((u) => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>

          <button onClick={() => setShowBase(!showBase)} className="text-xs text-primary hover:underline cursor-pointer">
            {showBase ? 'Hide' : 'Show'} base values
          </button>

          {showBase && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface rounded-lg border border-border">
              {[
                { key: 'fontSize', label: 'Font size (px)' },
                { key: 'parentWidth', label: 'Parent width (px)' },
                { key: 'viewportWidth', label: 'Viewport width (px)' },
                { key: 'viewportHeight', label: 'Viewport height (px)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] text-text-tertiary mb-1 block">{label}</label>
                  <input type="number" value={base[key]} onChange={(e) => handleBase(key, e.target.value)}
                    className="w-full bg-badge-bg rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-tertiary">Result</span>
            {result !== null && <CopyButton text={String(parseFloat(result.toFixed(6)))} />}
          </div>
          <div className="text-2xl font-mono text-text font-bold break-all">
            {result !== null
              ? `${parseFloat(result.toFixed(6))} ${toUnit}`
              : <span className="text-text-tertiary text-sm">Enter a valid number</span>
            }
          </div>
          {result !== null && (
            <div className="text-xs text-text-secondary mt-2 font-mono">
              ≈ {parseFloat(px.toFixed(4))} px
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">Quick reference</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ['1in', '96px'], ['1cm', '37.8px'], ['1mm', '3.78px'],
              ['1pt', '1.33px'], ['1pc', '16px'], ['1em', '16px'],
              ['1rem', '16px'], ['100vw', 'viewport'], ['100vh', 'viewport'],
            ].map(([a, b]) => (
              <div key={a} className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-1.5 border border-border">
                <span className="font-mono">{a}</span> = <span className="font-mono">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
