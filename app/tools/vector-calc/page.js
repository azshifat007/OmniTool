'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function dot(a, b) { return a.map((v, i) => v * b[i]).reduce((s, n) => s + n, 0); }
function cross(a, b) {
  if (a.length !== 3 || b.length !== 3) return null;
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function mag(v) { return Math.sqrt(v.reduce((s, n) => s + n * n, 0)); }
function angle(a, b) {
  const d = dot(a, b);
  const m = mag(a) * mag(b);
  return m === 0 ? 0 : Math.acos(d / m) * (180 / Math.PI);
}

export default function VectorCalcPage() {
  const { addEntry } = useHistory();
  const [dim, setDim] = useState('3d');
  const [v1, setV1] = useState({ x: 1, y: 0, z: 0 });
  const [v2, setV2] = useState({ x: 0, y: 1, z: 0 });

  const n = dim === '2d' ? 2 : 3;
  const v1Arr = [v1.x, v1.y, ...(n === 3 ? [v1.z] : [])];
  const v2Arr = [v2.x, v2.y, ...(n === 3 ? [v2.z] : [])];

  const results = useMemo(() => {
    addEntry('Vector Calculator');
    const d = dot(v1Arr, v2Arr);
    const c = n === 3 ? cross(v1Arr, v2Arr) : null;
    const m1 = mag(v1Arr);
    const m2 = mag(v2Arr);
    const a = angle(v1Arr, v2Arr);
    const sum = v1Arr.map((v, i) => v + v2Arr[i]);
    const diff = v1Arr.map((v, i) => v - v2Arr[i]);
    return { dot: d, cross: c, mag1: m1, mag2: m2, angle: a, sum, diff };
  }, [v1, v2, dim, addEntry]);

  const fmt = (v) => {
    if (Array.isArray(v)) return `(${v.map(n => n.toFixed(2)).join(', ')})`;
    return v.toFixed(2);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">→</span>
        <h1 className="font-heading text-2xl font-bold text-text">Vector Calculator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex items-center gap-3">
            {['2d', '3d'].map(d => (
              <button key={d} onClick={() => setDim(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  dim === d ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{d.toUpperCase()}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Vector A</span>
            <div className="grid grid-cols-3 gap-3">
              <label><span className="text-[11px] text-text-tertiary block mb-1">X</span>
                <input type="number" step="any" value={v1.x} onChange={e => setV1(p => ({ ...p, x: Number(e.target.value) }))}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>
              <label><span className="text-[11px] text-text-tertiary block mb-1">Y</span>
                <input type="number" step="any" value={v1.y} onChange={e => setV1(p => ({ ...p, y: Number(e.target.value) }))}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>
              {dim === '3d' && <label><span className="text-[11px] text-text-tertiary block mb-1">Z</span>
                <input type="number" step="any" value={v1.z} onChange={e => setV1(p => ({ ...p, z: Number(e.target.value) }))}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>}
            </div>
            <div className="pt-2">
              <span className="text-xs text-text-tertiary block">Vector B</span>
              <div className="grid grid-cols-3 gap-3 mt-1">
                <label><span className="text-[11px] text-text-tertiary block mb-1">X</span>
                  <input type="number" step="any" value={v2.x} onChange={e => setV2(p => ({ ...p, x: Number(e.target.value) }))}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>
                <label><span className="text-[11px] text-text-tertiary block mb-1">Y</span>
                  <input type="number" step="any" value={v2.y} onChange={e => setV2(p => ({ ...p, y: Number(e.target.value) }))}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>
                {dim === '3d' && <label><span className="text-[11px] text-text-tertiary block mb-1">Z</span>
                  <input type="number" step="any" value={v2.z} onChange={e => setV2(p => ({ ...p, z: Number(e.target.value) }))}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" /></label>}
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary block mb-3">Results</span>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">Dot Product</span>
                <span className="text-sm font-mono font-bold text-primary">{fmt(results.dot)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">|A| (Magnitude)</span>
                <span className="text-sm font-mono text-text">{fmt(results.mag1)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">|B| (Magnitude)</span>
                <span className="text-sm font-mono text-text">{fmt(results.mag2)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">Angle</span>
                <span className="text-sm font-mono text-text">{fmt(results.angle)}°</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">A + B</span>
                <span className="text-sm font-mono text-text">{fmt(results.sum)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                <span className="text-sm text-text-secondary">A - B</span>
                <span className="text-sm font-mono text-text">{fmt(results.diff)}</span>
              </div>
              {results.cross && (
                <div className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50">
                  <span className="text-sm text-text-secondary">A × B (Cross)</span>
                  <span className="text-sm font-mono text-text">{fmt(results.cross)}</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
