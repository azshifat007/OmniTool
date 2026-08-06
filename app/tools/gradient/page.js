'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const directions = [
  { id: 'to right', label: '→ To Right' },
  { id: 'to left', label: '← To Left' },
  { id: 'to bottom', label: '↓ To Bottom' },
  { id: 'to top', label: '↑ To Top' },
  { id: 'to bottom right', label: '↘ Diagonal' },
  { id: 'to top left', label: '↖ Diagonal' },
  { id: 'radial', label: '◎ Radial' },
];

export default function GradientPage() {
  const { addEntry } = useHistory();
  const [color1, setColor1] = useState('#ff6b6b');
  const [color2, setColor2] = useState('#48dbfb');
  const [color3, setColor3] = useState('');
  const [useThird, setUseThird] = useState(false);
  const [direction, setDirection] = useState('to right');

  const cssGradient = useCallback(() => {
    const stops = [color1, useThird && color3, color2].filter(Boolean).join(', ');
    if (direction === 'radial') return `radial-gradient(circle, ${stops})`;
    return `linear-gradient(${direction}, ${stops})`;
  }, [color1, color2, color3, useThird, direction]);

  const cssCode = `background: ${cssGradient()};`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">🎨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Gradient Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Color 1</label>
                  <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Color 2</label>
                  <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                </div>
                {useThird && (
                  <div className="flex-1">
                    <label className="text-xs text-text-tertiary mb-2 block">Color 3</label>
                    <input type="color" value={color3} onChange={(e) => setColor3(e.target.value)}
                      className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
                <input type="checkbox" checked={useThird} onChange={(e) => { setUseThird(e.target.checked); if (!e.target.checked) setColor3(''); }}
                  className="accent-primary" />
                Add third color stop
              </label>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Direction</label>
              <div className="flex flex-wrap gap-2">
                {directions.map((d) => (
                  <button key={d.id} onClick={() => setDirection(d.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      direction === d.id ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                    }`}
                  >{d.label}</button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
              <div className="w-full h-48 rounded-xl border border-border" style={{ background: cssGradient() }} />
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
