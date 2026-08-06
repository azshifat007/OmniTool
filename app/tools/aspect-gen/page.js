'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function AspectGenPage() {
  const { addEntry } = useHistory();
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [output, setOutput] = useState('');

  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

  const generate = useCallback(() => {
    const w = parseInt(width);
    const h = parseInt(height);
    if (!w || !h || w < 1 || h < 1) return;
    const g = gcd(w, h);
    const ratio = `${w / g} / ${h / g}`;
    const decimal = (w / h).toFixed(4);
    const css = [
      `/* Method 1: aspect-ratio property */`,
      `.element {`,
      `  aspect-ratio: ${ratio};`,
      `}`,
      ``,
      `/* Method 2: padding-bottom trick (legacy) */`,
      `.container {`,
      `  position: relative;`,
      `  width: 100%;`,
      `  padding-bottom: ${((h / w) * 100).toFixed(4)}%;`,
      `}`,
      `.container > * {`,
      `  position: absolute;`,
      `  inset: 0;`,
      `}`,
      ``,
      `/* Ratio: ${ratio} (${decimal}) */`,
    ].join('\n');
    setOutput(css);
    addEntry('CSS Aspect Ratio Generator');
  }, [width, height, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▬</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Aspect Ratio Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Width (px)</label>
                <input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Height (px)</label>
                <input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[{ w: 1920, h: 1080, l: '16:9' }, { w: 1920, h: 1200, l: '16:10' }, { w: 1080, h: 1080, l: '1:1' }, { w: 1080, h: 1920, l: '9:16' }, { w: 1200, h: 800, l: '3:2' }, { w: 1024, h: 768, l: '4:3' }, { w: 3840, h: 2160, l: '4K' }, { w: 1200, h: 630, l: 'OG' }, { w: 1500, h: 500, l: 'Banner' }].map(p => (
                <button key={p.l} onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className="px-2 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{p.l}</button>
              ))}
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
            {width && height > 0 && (
              <div className="space-y-2">
                <div className="bg-surface rounded-lg px-3 py-2 text-xs text-text-secondary border border-border/50 text-center">
                  Ratio: {width / gcd(parseInt(width), parseInt(height))}:{height / gcd(parseInt(width), parseInt(height))} ({(parseInt(width) / parseInt(height)).toFixed(4)})
                </div>
                <div className="bg-surface rounded-lg px-3 py-2 text-xs text-text-secondary border border-border/50 space-y-1">
                  <div className="text-text-tertiary mb-1">Scaled to common widths:</div>
                  {[320, 640, 768, 1024].map(sw => {
                    const sc = sw / parseInt(width);
                    const sh = Math.round(parseInt(height) * sc);
                    return <div key={sw} className="flex justify-between"><span>{sw}px wide</span><span className="font-mono text-text">{sw} × {sh}</span></div>;
                  })}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">CSS Code</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[200px]">{output || <span className="text-text-tertiary">Enter dimensions...</span>}</pre>
            {output && (
              <div className="mt-3 flex items-center justify-center bg-surface rounded-lg border border-border/50 p-4">
                <div style={{ aspectRatio: `${parseInt(width)} / ${parseInt(height)}`, maxWidth: '100%', width: 200, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', borderRadius: 8 }} />
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
