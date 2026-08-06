'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ANIM_TYPES = [
  'fade-in', 'fade-out', 'slide-up', 'slide-down', 'slide-left', 'slide-right',
  'bounce', 'spin', 'pulse', 'shake', 'flip', 'wobble',
];

const EASINGS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', label: 'Bounce' },
  { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Spring' },
  { value: 'cubic-bezier(0.6, -0.28, 0.74, 0.05)', label: 'Snap' },
];

const FILL_MODES = ['none', 'forwards', 'backwards', 'both'];

function generateKeyframes(type) {
  const frames = {
    'fade-in': { '0%': 'opacity: 0;', '100%': 'opacity: 1;' },
    'fade-out': { '0%': 'opacity: 1;', '100%': 'opacity: 0;' },
    'slide-up': { '0%': 'transform: translateY(20px); opacity: 0;', '100%': 'transform: translateY(0); opacity: 1;' },
    'slide-down': { '0%': 'transform: translateY(-20px); opacity: 0;', '100%': 'transform: translateY(0); opacity: 1;' },
    'slide-left': { '0%': 'transform: translateX(20px); opacity: 0;', '100%': 'transform: translateX(0); opacity: 1;' },
    'slide-right': { '0%': 'transform: translateX(-20px); opacity: 0;', '100%': 'transform: translateX(0); opacity: 1;' },
    bounce: { '0%, 100%': 'transform: translateY(0);', '50%': 'transform: translateY(-20px);' },
    spin: { '0%': 'transform: rotate(0deg);', '100%': 'transform: rotate(360deg);' },
    pulse: { '0%, 100%': 'transform: scale(1);', '50%': 'transform: scale(1.1);' },
    shake: { '0%, 100%': 'transform: translateX(0);', '25%': 'transform: translateX(-5px);', '50%': 'transform: translateX(5px);', '75%': 'transform: translateX(-5px);' },
    flip: { '0%': 'transform: perspective(400px) rotateY(0);', '100%': 'transform: perspective(400px) rotateY(360deg);' },
    wobble: {
      '0%': 'transform: translateX(0);',
      '15%': 'transform: translateX(-10px) rotate(-3deg);',
      '30%': 'transform: translateX(8px) rotate(2deg);',
      '45%': 'transform: translateX(-6px) rotate(-1deg);',
      '60%': 'transform: translateX(4px) rotate(1deg);',
      '100%': 'transform: translateX(0);',
    },
  };
  const f = frames[type] || frames['fade-in'];
  return Object.entries(f).map(([k, v]) => `  ${k} {\n    ${v}\n  }`).join('\n');
}

export default function CssAnimPage() {
  const { addEntry } = useHistory();
  const [animType, setAnimType] = useState('fade-in');
  const [duration, setDuration] = useState(1);
  const [delay, setDelay] = useState(0);
  const [iteration, setIteration] = useState(1);
  const [easing, setEasing] = useState('ease');
  const [fillMode, setFillMode] = useState('none');
  const [alternate, setAlternate] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [played, setPlayed] = useState(false);

  const animationName = `anim-${animType}`;

  const keyframesCSS = useMemo(() => {
    return `@keyframes ${animationName} {\n${generateKeyframes(animType)}\n}`;
  }, [animType, animationName]);

  const animationProperty = useMemo(() => {
    const iter = iteration === 0 ? 'infinite' : iteration;
    const dir = alternate ? ' alternate' : '';
    return `animation: ${animationName} ${duration}s ${easing} ${delay}s ${iter} ${fillMode}${dir};`;
  }, [animationName, duration, easing, delay, iteration, fillMode, alternate]);

  const fullCSS = `${keyframesCSS}\n\n.element {\n  ${animationProperty}\n}`;

  const handlePlay = useCallback(() => {
    setPlayKey((k) => k + 1);
    setPlayed(true);
    addEntry('CSS Animation Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◈</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Animation Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Animation Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {ANIM_TYPES.map((t) => (
                    <button key={t} onClick={() => setAnimType(t)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        animType === t ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Duration: {duration.toFixed(1)}s</label>
                <input type="range" min={0.1} max={5} step={0.1} value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-text-secondary"><span>0.1s</span><span>5s</span></div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Delay: {delay.toFixed(1)}s</label>
                <input type="range" min={0} max={2} step={0.1} value={delay} onChange={(e) => setDelay(parseFloat(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-text-secondary"><span>0s</span><span>2s</span></div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Iteration Count</label>
                <div className="flex gap-2 items-center">
                  <input type="range" min={1} max={10} step={1} value={iteration > 10 ? 10 : iteration} onChange={(e) => setIteration(parseInt(e.target.value))}
                    className="flex-1 accent-primary" disabled={iteration === 0} />
                  <select value={iteration === 0 ? 0 : Math.min(iteration, 10)} onChange={(e) => setIteration(parseInt(e.target.value))}
                    className="bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer w-16">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                    <option value={0}>∞</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Easing</label>
                <select value={easing} onChange={(e) => setEasing(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {EASINGS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Fill Mode</label>
                <div className="flex flex-wrap gap-2">
                  {FILL_MODES.map((f) => (
                    <button key={f} onClick={() => setFillMode(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer capitalize ${
                        fillMode === f ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                      }`}>{f}</button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer select-none">
                <input type="checkbox" checked={alternate} onChange={(e) => setAlternate(e.target.checked)}
                  className="accent-primary" />
                Alternate Direction
              </label>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Preview</span>
                <button onClick={handlePlay}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  ▶ Play
                </button>
              </div>
              <div className="w-full h-48 rounded-xl border border-border bg-surface flex items-center justify-center overflow-hidden">
                <div key={playKey}
                  className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-bold"
                  style={played ? { animation: `${animationName} ${duration}s ${easing} ${delay}s ${iteration === 0 ? 'infinite' : iteration} ${fillMode}${alternate ? ' alternate' : ''}` } : {}}>
                  ◈
                </div>
              </div>
              {!played && <p className="text-xs text-text-tertiary mt-2 text-center">Click Play to preview</p>}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">CSS Code</span>
                <CopyButton text={fullCSS} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre max-h-[240px]">{fullCSS}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
