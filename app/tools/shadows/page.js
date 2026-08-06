'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function ShadowsPage() {
  const { addEntry } = useHistory();
  const [offsetX, setOffsetX] = useState(4);
  const [offsetY, setOffsetY] = useState(4);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(0.4);
  const [color, setColor] = useState('#000000');
  const [inset, setInset] = useState(false);

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  const insetStr = inset ? 'inset ' : '';
  const cssCode = `box-shadow: ${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor};`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⬡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Box Shadow Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Offset X: {offsetX}px</label>
                  <input type="range" min={-50} max={50} value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Offset Y: {offsetY}px</label>
                  <input type="range" min={-50} max={50} value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Blur: {blur}px</label>
                  <input type="range" min={0} max={100} value={blur} onChange={(e) => setBlur(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Spread: {spread}px</label>
                  <input type="range" min={-50} max={50} value={spread} onChange={(e) => setSpread(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-text-tertiary mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
                <div className="w-20">
                  <label className="text-xs text-text-tertiary mb-2 block">Color</label>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
                <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)}
                  className="accent-primary" />
                Inset shadow
              </label>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
              <div className="w-full h-48 rounded-xl bg-surface border border-border flex items-center justify-center">
                <div className="w-32 h-32 rounded-xl bg-bg" style={{ boxShadow: `${insetStr}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${shadowColor}` }} />
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
      </div>
    </motion.div>
  );
}
