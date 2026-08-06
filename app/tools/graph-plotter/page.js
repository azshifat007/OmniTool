'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function evaluate(expr, x) {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/log\(/g, 'Math.log(')
    .replace(/exp\(/g, 'Math.exp(')
    .replace(/pi/gi, 'Math.PI')
    .replace(/e(?![xp])/g, 'Math.E');
  try {
    const fn = new Function('x', `return ${sanitized};`);
    const result = fn(x);
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch { return null; }
}

function draw(ctx, expr, width, height, xMin, xMax, yMin, yMax) {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 0.5;
  const steps = width;
  let hasDrawn = false;

  ctx.beginPath();
  for (let px = 0; px <= width; px++) {
    const x = xMin + (px / width) * (xMax - xMin);
    const y = evaluate(expr, x);
    if (y === null) { hasDrawn = false; continue; }
    if (y < yMin || y > yMax) { hasDrawn = false; continue; }
    const py = height - ((y - yMin) / (yMax - yMin)) * height;
    if (!hasDrawn) { ctx.moveTo(px, py); hasDrawn = true; }
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = '#6366F1'; ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5;
  const xStep = (xMax - xMin) / 10;
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
    const px = ((x - xMin) / (xMax - xMin)) * width;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
    ctx.fillStyle = '#94A3B8'; ctx.font = '10px monospace';
    ctx.textAlign = 'center'; ctx.fillText(x.toFixed(1), px, height - 4);
  }
  const yStep = (yMax - yMin) / 10;
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
    const py = height - ((y - yMin) / (yMax - yMin)) * height;
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(width, py); ctx.stroke();
    ctx.fillStyle = '#94A3B8'; ctx.font = '10px monospace';
    ctx.textAlign = 'right'; ctx.fillText(y.toFixed(1), width - 4, py + 3);
  }

  const originX = ((0 - xMin) / (xMax - xMin)) * width;
  const originY = height - ((0 - yMin) / (yMax - yMin)) * height;
  if (originX >= 0 && originX <= width) {
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height); ctx.stroke();
  }
  if (originY >= 0 && originY <= height) {
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY); ctx.stroke();
  }
}

const presets = [
  { label: 'x²', expr: 'x^2' },
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: '1/x', expr: '1/x' },
  { label: '√x', expr: 'sqrt(x)' },
  { label: 'e^x', expr: 'exp(x)' },
  { label: 'log(x)', expr: 'log(x)' },
  { label: '|x|', expr: 'abs(x)' },
];

export default function GraphPlotterPage() {
  const { addEntry } = useHistory();
  const canvasRef = useRef(null);
  const [expr, setExpr] = useState('x^2');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);

  const plot = useCallback(() => {
    addEntry('Graph Plotter');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.min(rect.width, 700);
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const aspect = canvas.width / canvas.height;
    const yRange = (xMax - xMin) / aspect;
    const yCenter = 0;
    draw(ctx, expr, canvas.width, canvas.height, xMin, xMax, yCenter - yRange / 2, yCenter + yRange / 2);
  }, [expr, xMin, xMax, addEntry]);

  useEffect(() => { plot(); }, [plot]);
  useEffect(() => {
    const onResize = () => plot();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [plot]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">╱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Graph Plotter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">f(x) =</label>
            <input value={expr} onChange={e => setExpr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && plot()}
              placeholder="x^2"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-text-tertiary mb-1 block">X min</label>
              <input type="number" value={xMin} onChange={e => setXMin(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface rounded-lg px-3 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-tertiary mb-1 block">X max</label>
              <input type="number" value={xMax} onChange={e => setXMax(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface rounded-lg px-3 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(p => (
              <button key={p.label} onClick={() => setExpr(p.expr)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${expr === p.expr ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border/50 hover:border-primary/40'}`}>
                f(x) = {p.label}
              </button>
            ))}
          </div>
          <button onClick={plot}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Plot
          </button>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-2 flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full max-w-[700px] h-[400px]" />
        </div>
      </GlassCard>

      <p className="text-xs text-text-tertiary mt-2 text-center">Supports: + - * / ^ sin cos tan sqrt abs log exp pi e. Example: sin(x) * cos(x)</p>
    </motion.div>
  );
}
