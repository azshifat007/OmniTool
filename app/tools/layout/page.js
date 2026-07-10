'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function LayoutPage() {
  const { addEntry } = useHistory();
  const [display, setDisplay] = useState('flex');
  const [direction, setDirection] = useState('row');
  const [justify, setJustify] = useState('center');
  const [align, setAlign] = useState('center');
  const [gap, setGap] = useState(8);
  const [cols, setCols] = useState(3);
  const [count, setCount] = useState(4);

  const cssCode = useCallback(() => {
    let css = '';
    if (display === 'flex') {
      css = `.container {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  gap: ${gap}px;\n}`;
    } else {
      css = `.container {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  gap: ${gap}px;\n}`;
    }
    return css;
  }, [display, direction, justify, align, gap, cols]);

  const boxes = Array.from({ length: count }, (_, i) => i);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Layout Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-xs text-text-tertiary block mb-1">Display</span>
                <select value={display} onChange={e => setDisplay(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                  <option value="flex">Flexbox</option>
                  <option value="grid">Grid</option>
                </select>
              </label>
              {display === 'flex' && (
                <label className="flex-1">
                  <span className="text-xs text-text-tertiary block mb-1">Direction</span>
                  <select value={direction} onChange={e => setDirection(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                    <option value="row-reverse">Row Reverse</option>
                    <option value="column-reverse">Column Reverse</option>
                  </select>
                </label>
              )}
              {display === 'grid' && (
                <label className="flex-1">
                  <span className="text-xs text-text-tertiary block mb-1">Columns</span>
                  <input type="number" min={1} max={12} value={cols} onChange={e => setCols(Number(e.target.value))}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
                </label>
              )}
            </div>
            {display === 'flex' && (
              <div className="flex gap-4">
                <label className="flex-1">
                  <span className="text-xs text-text-tertiary block mb-1">Justify</span>
                  <select value={justify} onChange={e => setJustify(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                    {['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </label>
                <label className="flex-1">
                  <span className="text-xs text-text-tertiary block mb-1">Align</span>
                  <select value={align} onChange={e => setAlign(e.target.value)}
                    className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                    {['flex-start', 'center', 'flex-end', 'stretch'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <div className="flex gap-4">
              <label className="flex-1">
                <span className="text-xs text-text-tertiary block mb-1">Gap: {gap}px</span>
                <input type="range" min={0} max={40} value={gap} onChange={e => setGap(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
              </label>
              <label className="w-20">
                <span className="text-xs text-text-tertiary block mb-1">Items</span>
                <input type="number" min={1} max={12} value={count} onChange={e => setCount(Number(e.target.value))}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
              </label>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Preview</span>
              </div>
              <div className="bg-surface rounded-xl border border-border p-4 min-h-[180px]"
                style={{ display, flexDirection: direction, justifyContent: justify, alignItems: align, gap, gridTemplateColumns: display === 'grid' ? `repeat(${cols}, 1fr)` : undefined }}>
                {boxes.map(i => (
                  <div key={i} className="bg-primary/20 rounded-lg p-4 text-center text-xs text-primary font-medium">{i + 1}</div>
                ))}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS Code</span>
                <CopyButton text={cssCode()} />
              </div>
              <pre className="text-xs font-mono text-text-secondary bg-surface rounded-lg p-3 border border-border overflow-x-auto">{cssCode()}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
