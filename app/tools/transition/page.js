'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const timingFunctions = [
  'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear',
  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'steps(4, end)', 'steps(4, jump-start)',
];

const properties = ['opacity', 'transform', 'color', 'background', 'all'];

export default function TransitionPage() {
  const { addEntry } = useHistory();
  const [prop, setProp] = useState('transform');
  const [duration, setDuration] = useState(300);
  const [delay, setDelay] = useState(0);
  const [timing, setTiming] = useState('ease');
  const [hovered, setHovered] = useState(false);

  const css = `.box {
  transition: ${prop} ${duration}ms ${timing} ${delay}ms;
}

.box:hover {
  ${prop === 'opacity' ? 'opacity: 0.3;' : ''}
  ${prop === 'transform' ? 'transform: scale(1.15) rotate(5deg);' : ''}
  ${prop === 'color' ? 'color: #ef4444;' : ''}
  ${prop === 'background' ? 'background: linear-gradient(135deg, #667eea, #764ba2);' : ''}
  ${prop === 'all' ? 'transform: scale(1.1); background: linear-gradient(135deg, #667eea, #764ba2); color: white;' : ''}
}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">▶</span>
        <h1 className="font-heading text-2xl font-bold text-text">Transition Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Property</label>
                <div className="flex flex-wrap gap-2">
                  {properties.map((p) => (
                    <button key={p} onClick={() => setProp(p)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        prop === p ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Duration: {duration}ms</label>
                <input type="range" min={50} max={2000} step={50} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Delay: {delay}ms</label>
                <input type="range" min={0} max={1000} step={50} value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Timing Function</label>
                <div className="flex flex-wrap gap-1.5">
                  {timingFunctions.map((t) => (
                    <button key={t} onClick={() => setTiming(t)}
                      className={`text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer font-mono ${
                        timing === t ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                      }`}>{t.length > 16 ? t.slice(0, 14) + '…' : t}</button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">CSS</span>
                <CopyButton text={css} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap">{css}</pre>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Preview (hover over the box)</span>
              <div className="bg-surface rounded-lg border border-border p-8 flex items-center justify-center">
                <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                  className="w-48 h-48 rounded-2xl flex items-center justify-center text-sm font-bold cursor-pointer select-none"
                  style={{
                    transition: `${prop} ${duration}ms ${timing} ${delay}ms`,
                    opacity: hovered && prop === 'opacity' ? 0.3 : 1,
                    transform: hovered && (prop === 'transform' || prop === 'all') ? 'scale(1.15) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    color: hovered && (prop === 'color' || prop === 'all') ? '#ef4444' : 'var(--text, #1e293b)',
                    background: hovered && (prop === 'background' || prop === 'all')
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'linear-gradient(135deg, #dbeafe, #e0f2fe)',
                  }}>
                  Hover me
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
