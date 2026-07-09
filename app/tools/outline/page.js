'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const styles = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];

export default function OutlinePage() {
  const { addEntry } = useHistory();
  const [width, setWidth] = useState(3);
  const [style, setStyle] = useState('solid');
  const [color, setColor] = useState('#3b82f6');
  const [offset, setOffset] = useState(0);

  const css = `outline: ${width}px ${style} ${color};
outline-offset: ${offset}px;`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◎</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Outline Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="bg-surface rounded-xl border border-border p-8 flex items-center justify-center min-h-[200px]">
              <div className="bg-white rounded-2xl w-48 h-48 flex items-center justify-center text-sm font-bold text-gray-600 select-none"
                style={{ outline: `${width}px ${style} ${color}`, outlineOffset: `${offset}px` }}>
                Preview
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Width: {width}px</label>
                <input type="range" min={1} max={20} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Offset: {offset}px</label>
                <input type="range" min={-10} max={20} value={offset} onChange={(e) => setOffset(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {styles.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Color</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 rounded-lg cursor-pointer border border-border" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">CSS</span>
              <CopyButton text={css} />
            </div>
            <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap">{css}</pre>

            <div className="border-t border-border pt-4">
              <span className="text-xs text-text-tertiary mb-3 block">Info</span>
              <div className="text-[11px] text-text-secondary leading-relaxed space-y-1">
                <div>• Outline is drawn outside the border</div>
                <div>• Does not affect layout (no box sizing)</div>
                <div>• outline-offset can be negative</div>
                <div>• Commonly used for focus indicators</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
