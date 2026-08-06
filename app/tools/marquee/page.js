'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const directions = ['left', 'right', 'up', 'down'];

export default function MarqueePage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('Hello! This text scrolls ✨');
  const [speed, setSpeed] = useState(10);
  const [dir, setDir] = useState('left');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#6C5CE7');
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    const duration = Math.max(2, 20 - speed);
    const keyframe = dir === 'left' ? '{ transform: translateX(100%); }' : dir === 'right' ? '{ transform: translateX(-100%); }' : dir === 'up' ? '{ transform: translateY(100%); }' : '{ transform: translateY(-100%); }';
    const endKeyframe = dir === 'left' ? '{ transform: translateX(-100%); }' : dir === 'right' ? '{ transform: translateX(100%); }' : dir === 'up' ? '{ transform: translateY(-100%); }' : '{ transform: translateY(100%); }';
    const css = `@keyframes marquee-${dir} {\n  from ${keyframe}\n  to ${endKeyframe}\n}\n\n.marquee-${dir} {\n  overflow: hidden;\n  white-space: nowrap;\n  animation: marquee-${dir} ${duration}s linear infinite;\n  font-size: ${fontSize}px;\n  color: ${color};\n}`;
    const html = `<div class="marquee-${dir}">${text}</div>`;
    setOutput(css + '\n\n<!-- HTML -->\n' + html);
    addEntry('CSS Marquee Generator');
  }, [text, speed, dir, fontSize, color, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▶</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Marquee Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Text</label>
              <input value={text} onChange={(e) => setText(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Direction</label>
                <select value={dir} onChange={(e) => setDir(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  {directions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Speed: {speed}</label>
                <input type="range" min={1} max={20} value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Font Size: {fontSize}px</label>
                <input type="range" min={12} max={72} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <span className="text-xs font-mono text-text-secondary">{color}</span>
                </div>
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Preview</span>
              {output && (
                <div className="bg-surface rounded-lg border border-border/50 p-4 overflow-hidden" style={{ whiteSpace: 'nowrap' }}>
                  <style>{output.split('\n<!-- HTML -->')[0]}</style>
                  <div style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    animation: `marquee-${dir} ${Math.max(2, 20 - speed)}s linear infinite`,
                    fontSize: `${fontSize}px`,
                    color: color,
                  }}>{text}</div>
                </div>
              )}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS + HTML</span>
                {output && <CopyButton text={output} />}
              </div>
              <pre className="bg-surface rounded-lg px-3 py-2.5 text-xs font-mono text-text border border-border whitespace-pre-wrap max-h-[200px] overflow-y-auto">{output || <span className="text-text-tertiary">Generate marquee...</span>}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
