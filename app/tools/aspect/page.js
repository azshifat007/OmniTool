'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplifyRatio(w, h) {
  const g = gcd(w, h);
  return { w: w / g, h: h / g };
}

const namedRatios = [
  { w: 16, h: 9, name: '16:9 (HD)' },
  { w: 4, h: 3, name: '4:3 (Standard)' },
  { w: 1, h: 1, name: '1:1 (Square)' },
  { w: 21, h: 9, name: '21:9 (Ultrawide)' },
  { w: 3, h: 2, name: '3:2 (Photo)' },
  { w: 5, h: 4, name: '5:4 (SXGA)' },
  { w: 9, h: 16, name: '9:16 (Portrait)' },
];

function findNamedRatio(w, h) {
  const s = simplifyRatio(w, h);
  return namedRatios.find(r => r.w === s.w && r.h === s.h) || null;
}

const presets = [
  { label: '16:9', w: 16, h: 9 },
  { label: '4:3', w: 4, h: 3 },
  { label: '1:1', w: 1, h: 1 },
  { label: '21:9', w: 21, h: 9 },
  { label: '3:2', w: 3, h: 2 },
  { label: '5:4', w: 5, h: 4 },
  { label: '9:16', w: 9, h: 16 },
];

export default function AspectPage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('ratio');
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [knownDim, setKnownDim] = useState('width');
  const [knownValue, setKnownValue] = useState('1920');
  const [ratioW, setRatioW] = useState('16');
  const [ratioH, setRatioH] = useState('9');
  const [result, setResult] = useState(null);

  const calculateRatio = useCallback(() => {
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (!w || !h || w < 1 || h < 1) return;
    const s = simplifyRatio(w, h);
    const named = findNamedRatio(w, h);
    setResult({ type: 'ratio', w, h, sw: s.w, sh: s.h, named });
    addEntry('Aspect Ratio Calculator');
  }, [width, height, addEntry]);

  const calculateDim = useCallback(() => {
    const val = parseInt(knownValue, 10);
    const rw = parseInt(ratioW, 10);
    const rh = parseInt(ratioH, 10);
    if (!val || val < 1 || !rw || !rh || rw < 1 || rh < 1) return;
    const other = knownDim === 'width'
      ? Math.round(val * rh / rw)
      : Math.round(val * rw / rh);
    const resultWidth = knownDim === 'width' ? val : other;
    const resultHeight = knownDim === 'height' ? val : other;
    const s = simplifyRatio(rw, rh);
    const named = findNamedRatio(rw, rh);
    setResult({ type: 'dim', w: resultWidth, h: resultHeight, sw: s.w, sh: s.h, named });
    addEntry('Aspect Ratio Calculator');
  }, [knownDim, knownValue, ratioW, ratioH, addEntry]);

  const previewStyle = result
    ? { aspectRatio: `${result.sw}/${result.sh}`, maxWidth: '100%', maxHeight: '200px' }
    : {};

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▭</span>
        <h1 className="font-heading text-2xl font-bold text-text">Aspect Ratio Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                {[
                  { id: 'ratio', label: 'Calculate Ratio' },
                  { id: 'dim', label: 'Calculate Dimensions' },
                ].map(m => (
                  <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      mode === m.id ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                    }`}
                  >{m.label}</button>
                ))}
              </div>

              {mode === 'ratio' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-tertiary mb-2 block">Width (px)</label>
                      <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} min="1"
                        className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary mb-2 block">Height (px)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min="1"
                        className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <button onClick={calculateRatio} className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Get Ratio</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['width', 'height'].map(d => (
                      <button key={d} onClick={() => setKnownDim(d)}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          knownDim === d ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                        }`}
                      >{d.charAt(0).toUpperCase() + d.slice(1)}</button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-text-tertiary mb-2 block">{knownDim === 'width' ? 'Width' : 'Height'} (px)</label>
                    <input type="number" value={knownValue} onChange={(e) => setKnownValue(e.target.value)} min="1"
                      className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs text-text-tertiary mb-2 block">Target Ratio</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" value={ratioW} onChange={(e) => setRatioW(e.target.value)} min="1"
                        className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                      <input type="number" value={ratioH} onChange={(e) => setRatioH(e.target.value)} min="1"
                        className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <button onClick={calculateDim} className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Common Ratio Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.label} onClick={() => { setRatioW(String(p.w)); setRatioH(String(p.h)); setMode('dim'); setResult(null); }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-tertiary hover:text-text border border-border hover:border-primary/40 transition-all cursor-pointer"
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          {result && (
            <>
              <GlassCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">Result</span>
                    <CopyButton text={`${result.sw}:${result.sh}`} />
                  </div>
                  <div className="bg-surface rounded-xl px-4 py-3 text-center border border-border/50">
                    <span className="text-2xl font-bold text-text font-mono">{result.sw}:{result.sh}</span>
                  </div>
                  {result.named && (
                    <div className="bg-surface rounded-xl px-4 py-3 text-center border border-border/50">
                      <span className="text-sm text-text">{result.named.name}</span>
                    </div>
                  )}
                  <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                    <span className="text-xs text-text-tertiary block mb-1">Dimensions</span>
                    <span className="text-sm font-mono text-text">{result.w} × {result.h} px</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-4">
                  <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
                  <div className="w-full flex items-center justify-center bg-surface rounded-xl border border-border/50 p-4">
                    <div className="bg-primary/20 rounded-lg flex items-center justify-center" style={previewStyle}>
                      <span className="text-xs font-mono text-text-tertiary">{result.sw}:{result.sh}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
