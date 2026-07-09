'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const shapes = {
  Square: {
    dims: [{ key: 'side', label: 'Side', unit: '' }],
    type: '2d',
    calc: (v) => {
      const s = parseFloat(v.side);
      const perimeter = 4 * s;
      const area = s * s;
      return { perimeter, area, formula: { perimeter: 'P = 4s', area: 'A = s²' } };
    },
  },
  Rectangle: {
    dims: [
      { key: 'width', label: 'Width', unit: '' },
      { key: 'height', label: 'Height', unit: '' },
    ],
    type: '2d',
    calc: (v) => {
      const w = parseFloat(v.width);
      const h = parseFloat(v.height);
      return { perimeter: 2 * (w + h), area: w * h, formula: { perimeter: 'P = 2(l + w)', area: 'A = lw' } };
    },
  },
  Circle: {
    dims: [{ key: 'radius', label: 'Radius', unit: '' }],
    type: '2d',
    calc: (v) => {
      const r = parseFloat(v.radius);
      return { perimeter: 2 * Math.PI * r, area: Math.PI * r * r, formula: { perimeter: 'C = 2πr', area: 'A = πr²' } };
    },
  },
  Triangle: {
    dims: [
      { key: 'a', label: 'Side a', unit: '' },
      { key: 'b', label: 'Side b', unit: '' },
      { key: 'c', label: 'Side c', unit: '' },
    ],
    type: '2d',
    calc: (v) => {
      const a = parseFloat(v.a);
      const b = parseFloat(v.b);
      const c = parseFloat(v.c);
      const perimeter = a + b + c;
      const s = perimeter / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      return { perimeter, area, formula: { perimeter: 'P = a + b + c', area: 'A = √(s(s-a)(s-b)(s-c))' } };
    },
  },
  Cube: {
    dims: [{ key: 'side', label: 'Side', unit: '' }],
    type: '3d',
    calc: (v) => {
      const s = parseFloat(v.side);
      return { surfaceArea: 6 * s * s, volume: s * s * s, formula: { surfaceArea: 'SA = 6s²', volume: 'V = s³' } };
    },
  },
  Sphere: {
    dims: [{ key: 'radius', label: 'Radius', unit: '' }],
    type: '3d',
    calc: (v) => {
      const r = parseFloat(v.radius);
      return { surfaceArea: 4 * Math.PI * r * r, volume: (4 / 3) * Math.PI * r * r * r, formula: { surfaceArea: 'SA = 4πr²', volume: 'V = ⁴⁄₃πr³' } };
    },
  },
  Cylinder: {
    dims: [
      { key: 'radius', label: 'Radius', unit: '' },
      { key: 'height', label: 'Height', unit: '' },
    ],
    type: '3d',
    calc: (v) => {
      const r = parseFloat(v.radius);
      const h = parseFloat(v.height);
      return { surfaceArea: 2 * Math.PI * r * (r + h), volume: Math.PI * r * r * h, formula: { surfaceArea: 'SA = 2πr(r + h)', volume: 'V = πr²h' } };
    },
  },
  Cone: {
    dims: [
      { key: 'radius', label: 'Radius', unit: '' },
      { key: 'height', label: 'Height', unit: '' },
    ],
    type: '3d',
    calc: (v) => {
      const r = parseFloat(v.radius);
      const h = parseFloat(v.height);
      const l = Math.sqrt(r * r + h * h);
      return { surfaceArea: Math.PI * r * (r + l), volume: (1 / 3) * Math.PI * r * r * h, formula: { surfaceArea: 'SA = πr(r + l)', volume: 'V = ⅓πr²h' } };
    },
  },
};

function ShapeSvg({ shape }) {
  const size = 160;
  switch (shape) {
    case 'Square':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" rx="2" />
          <text x="50" y="55" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">s</text>
        </svg>
      );
    case 'Rectangle':
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 120 80">
          <rect x="10" y="10" width="100" height="60" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" rx="2" />
          <text x="60" y="55" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">l</text>
          <text x="72" y="22" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">w</text>
        </svg>
      );
    case 'Circle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <line x1="50" y1="50" x2="90" y2="50" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeDasharray="3" />
          <text x="65" y="45" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">r</text>
        </svg>
      );
    case 'Triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,5 95,85 5,85" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <text x="50" y="78" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">b</text>
          <text x="72" y="55" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">a</text>
          <text x="28" y="55" textAnchor="end" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">c</text>
        </svg>
      );
    case 'Cube':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,15 85,30 50,45 15,30" fill="var(--color-primary-light)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="2" />
          <polygon points="50,45 85,30 85,65 50,80" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
          <polygon points="15,30 50,45 50,80 15,65" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="3" />
          <text x="50" y="30" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">s</text>
        </svg>
      );
    case 'Sphere':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="40" ry="40" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <ellipse cx="50" cy="50" rx="20" ry="40" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3" />
          <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="2" />
          <line x1="50" y1="50" x2="90" y2="50" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeDasharray="3" />
          <text x="65" y="45" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">r</text>
        </svg>
      );
    case 'Cylinder':
      return (
        <svg width={size * 0.8} height={size} viewBox="0 0 80 100">
          <ellipse cx="40" cy="20" rx="35" ry="12" fill="var(--color-primary-light)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="2" />
          <line x1="5" y1="20" x2="5" y2="80" stroke="var(--color-primary)" strokeWidth="2" />
          <line x1="75" y1="20" x2="75" y2="80" stroke="var(--color-primary)" strokeWidth="2" />
          <ellipse cx="40" cy="80" rx="35" ry="12" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
          <line x1="40" y1="20" x2="40" y2="80" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeDasharray="3" />
          <text x="15" y="55" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">r</text>
          <text x="42" y="55" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">h</text>
        </svg>
      );
    case 'Cone':
      return (
        <svg width={size * 0.7} height={size} viewBox="0 0 70 100">
          <polygon points="35,5 68,85 2,85" fill="var(--color-primary-light)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="2" />
          <ellipse cx="35" cy="85" rx="33" ry="10" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
          <line x1="35" y1="5" x2="35" y2="85" stroke="var(--color-text-tertiary)" strokeWidth="1" strokeDasharray="3" />
          <text x="38" y="50" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">h</text>
          <text x="45" y="78" textAnchor="start" fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-mono)">r</text>
        </svg>
      );
    default:
      return null;
  }
}

export default function GeometryPage() {
  const { addEntry } = useHistory();
  const [shape, setShape] = useState('Square');
  const [values, setValues] = useState({ side: '' });
  const [result, setResult] = useState(null);

  const handleShape = useCallback((s) => {
    setShape(s);
    const dims = shapes[s].dims;
    const init = {};
    dims.forEach((d) => (init[d.key] = ''));
    setValues(init);
    setResult(null);
  }, []);

  const handleInput = useCallback((key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const calculate = useCallback(() => {
    const cfg = shapes[shape];
    const missing = cfg.dims.some((d) => isNaN(parseFloat(values[d.key])) || values[d.key] === '');
    if (missing) return;
    const res = cfg.calc(values);
    setResult(res);
    addEntry('Geometry Calculator');
  }, [shape, values, addEntry]);

  const cfg = shapes[shape];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">◇</span>
        <h1 className="font-heading text-2xl font-bold text-text">Geometry Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Select a Shape</span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(shapes).map((s) => (
                <button key={s} onClick={() => handleShape(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    shape === s ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{s}</button>
              ))}
            </div>

            <div className="flex items-center justify-center py-4">
              <ShapeSvg shape={shape} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cfg.dims.map((d) => (
                <div key={d.key}>
                  <label className="text-xs text-text-tertiary mb-1 block">{d.label}</label>
                  <input type="number" value={values[d.key]} onChange={(e) => handleInput(d.key, e.target.value)} placeholder={d.label} min="0" step="any"
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              ))}
            </div>

            <button onClick={calculate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Results</span>
            {result ? (
              <div className="space-y-4">
                {cfg.type === '2d' ? (
                  <>
                    <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                      <div className="text-xs text-text-tertiary mb-1">Perimeter</div>
                      <div className="text-lg font-bold text-text font-mono">
                        {result.perimeter.toFixed(4)}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 font-mono">
                        {result.formula.perimeter}
                      </div>
                    </div>
                    <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                      <div className="text-xs text-text-tertiary mb-1">Area</div>
                      <div className="text-lg font-bold text-text font-mono">
                        {result.area.toFixed(4)}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 font-mono">
                        {result.formula.area}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                      <div className="text-xs text-text-tertiary mb-1">Surface Area</div>
                      <div className="text-lg font-bold text-text font-mono">
                        {result.surfaceArea.toFixed(4)}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 font-mono">
                        {result.formula.surfaceArea}
                      </div>
                    </div>
                    <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                      <div className="text-xs text-text-tertiary mb-1">Volume</div>
                      <div className="text-lg font-bold text-text font-mono">
                        {result.volume.toFixed(4)}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 font-mono">
                        {result.formula.volume}
                      </div>
                    </div>
                  </>
                )}
                <CopyButton text={`${cfg.type === '2d' ? `Perimeter: ${result.perimeter.toFixed(4)}\nArea: ${result.area.toFixed(4)}` : `Surface Area: ${result.surfaceArea.toFixed(4)}\nVolume: ${result.volume.toFixed(4)}`}`} />
              </div>
            ) : (
              <div className="text-xs text-text-tertiary py-8 text-center">
                Enter dimensions and click Calculate
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
