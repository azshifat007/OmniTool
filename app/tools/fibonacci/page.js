'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function generateFibonacci(count, a, b) {
  const seq = [a, b];
  for (let i = 2; i < count; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, count);
}

function Spiral({ sequence }) {
  if (sequence.length < 3) return null;
  const colors = [
    'var(--color-cat-math)',
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-cat-network)',
    'var(--color-cat-success)',
    'var(--color-cat-design)',
    'var(--color-cat-date)',
    'var(--color-cat-text)',
  ];
  const maxVal = Math.max(...sequence);
  const size = 220;
  const center = size / 2;
  let x = center;
  let y = center;
  let direction = 0;
  const dirs = [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {sequence.slice(0, 12).map((val, i) => {
        const side = Math.max(4, (val / maxVal) * 80);
        const dx = dirs[direction][0] * side;
        const dy = dirs[direction][1] * side;
        const nx = x + dx;
        const ny = y + dy;
        const color = colors[i % colors.length];
        const path = [];
        if (direction === 0) {
          path.push(`M ${x} ${y} L ${nx} ${ny} L ${nx} ${ny - side} L ${x} ${y - side} Z`);
        } else if (direction === 1) {
          path.push(`M ${x} ${y} L ${nx} ${ny} L ${nx - side} ${ny} L ${x - side} ${y} Z`);
        } else if (direction === 2) {
          path.push(`M ${x} ${y} L ${nx} ${ny} L ${nx} ${ny + side} L ${x} ${y + side} Z`);
        } else {
          path.push(`M ${x} ${y} L ${nx} ${ny} L ${nx + side} ${ny} L ${x + side} ${y} Z`);
        }
        const arc = `M ${x} ${y} A ${side} ${side} 0 0 ${direction % 2 === 0 ? 0 : 1} ${nx} ${ny}`;
        const result = { path: path[0], arc, color, label: i < 6 ? val : null };
        x = nx;
        y = ny - side;
        direction = (direction + 1) % 4;
        return result;
      }).map((item, idx) => (
        <g key={idx}>
          <path d={item.path} fill={item.color} fillOpacity="0.12" stroke={item.color} strokeWidth="1.5" />
          <path d={item.arc} fill="none" stroke={item.color} strokeWidth="1.5" strokeDasharray="3 2" />
          {item.label !== null && (
            <text x={0} y={0} fill="var(--color-text-secondary)" fontSize="8" fontFamily="var(--font-mono)">
              <tspan>{item.label}</tspan>
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function FibonacciPage() {
  const { addEntry } = useHistory();
  const [count, setCount] = useState(10);
  const [startA, setStartA] = useState('0');
  const [startB, setStartB] = useState('1');
  const [sequence, setSequence] = useState(null);

  const generate = useCallback(() => {
    const a = parseInt(startA, 10);
    const b = parseInt(startB, 10);
    const c = parseInt(count, 10);
    if (isNaN(a) || isNaN(b) || isNaN(c) || c < 1 || c > 50) return;
    const seq = generateFibonacci(c, a, b);
    setSequence(seq);
    addEntry('Fibonacci Generator');
  }, [startA, startB, count, addEntry]);

  const stats = useMemo(() => {
    if (!sequence || sequence.length < 2) return null;
    const sum = sequence.reduce((s, v) => s + v, 0);
    const ratios = [];
    for (let i = 2; i < sequence.length; i++) {
      if (sequence[i - 1] !== 0) {
        ratios.push({ index: i, ratio: sequence[i] / sequence[i - 1] });
      }
    }
    const golden = sequence.length >= 3 && sequence[sequence.length - 2] !== 0
      ? sequence[sequence.length - 1] / sequence[sequence.length - 2]
      : null;
    return { sum, ratios, golden };
  }, [sequence]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">✦</span>
        <h1 className="font-heading text-2xl font-bold text-text">Fibonacci Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Parameters</span>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Count ({count})</label>
              <input type="range" min="1" max="50" value={count} onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-xs text-text-tertiary mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Start A</label>
                <input type="number" value={startA} onChange={(e) => setStartA(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Start B</label>
                <input type="number" value={startB} onChange={(e) => setStartB(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <button onClick={generate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Generate
            </button>

            {sequence && stats && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">Sum</span>
                  <span className="font-mono text-text font-medium">{stats.sum.toLocaleString()}</span>
                </div>
                {stats.golden !== null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-tertiary">Golden Ratio (Fₙ/Fₙ₋₁)</span>
                    <span className="font-mono text-text font-medium">{stats.golden.toFixed(10)}</span>
                  </div>
                )}
                <div className="text-xs text-text-tertiary pt-1">
                  φ ≈ 1.6180339887
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Sequence</span>
            {sequence ? (
              <>
                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 max-h-[200px] overflow-y-auto">
                  <div className="text-xs font-mono text-text leading-relaxed break-all">
                    {sequence.join(', ')}
                  </div>
                </div>
                <CopyButton text={sequence.join(', ')} />

                {stats && stats.ratios.length > 0 && (
                  <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                    <div className="text-xs text-text-tertiary mb-2">Ratios Fₙ / Fₙ₋₁</div>
                    <div className="space-y-1 max-h-[180px] overflow-y-auto">
                      {stats.ratios.map((r, i) => (
                        <div key={i} className="flex justify-between text-xs font-mono">
                          <span className="text-text-tertiary">F<sub>{r.index}</sub> / F<sub>{r.index - 1}</sub></span>
                          <span className="text-text">{r.ratio.toFixed(6)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Spiral sequence={sequence} />
                </div>
              </>
            ) : (
              <div className="text-xs text-text-tertiary py-8 text-center">
                Adjust parameters and click Generate
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
