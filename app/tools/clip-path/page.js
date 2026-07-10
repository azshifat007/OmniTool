'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const shapes = [
  { name: 'Triangle', value: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { name: 'Circle', value: 'circle(50% at 50% 50%)' },
  { name: 'Rounded', value: 'inset(5% 5% 5% 5% round 20px)' },
  { name: 'Hexagon', value: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
  { name: 'Star (5)', value: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
  { name: 'Diamond', value: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  { name: 'Parallelogram', value: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' },
  { name: 'Trapezoid', value: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' },
  { name: 'Chevron', value: 'polygon(0% 0%, 100% 0%, 80% 50%, 100% 100%, 0% 100%, 20% 50%)' },
  { name: 'Blob', value: 'ellipse(40% 45% at 50% 50%)' },
];

export default function ClipPathPage() {
  const { addEntry } = useHistory();
  const [selected, setSelected] = useState(shapes[0]);
  const [custom, setCustom] = useState('');
  const [bgColor, setBgColor] = useState('#6C5CE7');
  const output = custom || selected.value;

  const handleShape = useCallback((s) => {
    setSelected(s);
    setCustom('');
    addEntry('CSS Clip Path Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◇</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Clip Path Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Preset Shapes</label>
              <div className="flex flex-wrap gap-1.5">
                {shapes.map(s => (
                  <button key={s.name} onClick={() => handleShape(s)}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                      selected.name === s.name && !custom ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:text-text'
                    }`}>{s.name}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Custom clip-path value</label>
              <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="polygon(...)"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Background Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <span className="text-sm font-mono text-text-secondary">{bgColor}</span>
              </div>
            </div>
          </div>
        </GlassCard>
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
              <div className="flex items-center justify-center bg-surface rounded-lg border border-border/50 p-6 min-h-[180px]">
                <div style={{ clipPath: output, background: bgColor, width: 200, height: 200 }} />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS</span>
                <CopyButton text={`clip-path: ${output};`} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-2.5 text-sm font-mono text-text border border-border whitespace-pre-wrap">clip-path: {output};</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
