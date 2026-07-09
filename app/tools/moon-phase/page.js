'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const phaseNames = [
  { name: 'New Moon', icon: '🌑' },
  { name: 'Waxing Crescent', icon: '🌒' },
  { name: 'First Quarter', icon: '🌓' },
  { name: 'Waxing Gibbous', icon: '🌔' },
  { name: 'Full Moon', icon: '🌕' },
  { name: 'Waning Gibbous', icon: '🌖' },
  { name: 'Last Quarter', icon: '🌗' },
  { name: 'Waning Crescent', icon: '🌘' },
];

function moonPhase(date) {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0);
  const diff = (date.getTime() - knownNewMoon.getTime()) / 1000;
  const days = diff / 86400;
  const lunarCycle = 29.53058867;
  const age = ((days % lunarCycle) + lunarCycle) % lunarCycle;
  const illumination = (1 - Math.cos((age / lunarCycle) * 2 * Math.PI)) / 2;
  const phaseIndex = Math.round(age / lunarCycle * 8) % 8;
  return { age, illumination: illumination * 100, phase: phaseNames[phaseIndex], phaseIndex, days };
}

function drawMoon(canvas, illumination, phaseIndex) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 10;

  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, '#f5f5dc');
  grad.addColorStop(1, '#c8b88a');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  const shadow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  shadow.addColorStop(0, 'rgba(0,0,0,0)');
  shadow.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = shadow;
  ctx.fill();

  const darkSide = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  darkSide.addColorStop(0, 'rgba(20,20,30,0.95)');
  darkSide.addColorStop(1, 'rgba(10,10,15,1)');

  const isWaxing = phaseIndex >= 1 && phaseIndex <= 3;
  const isWaning = phaseIndex >= 5 && phaseIndex <= 7;

  if (phaseIndex === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    return;
  }

  if (phaseIndex === 4) return;

  const terminator = (1 - illumination / 100) * r;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const dir = isWaning ? -1 : 1;

  ctx.beginPath();
  ctx.ellipse(cx + dir * (r - terminator), cy, terminator, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  ctx.restore();
}

export default function MoonPhasePage() {
  const { addEntry } = useHistory();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const canvasRef = useRef(null);

  const d = new Date(date + 'T12:00:00');
  const { age, illumination, phase, phaseIndex } = moonPhase(d);

  useEffect(() => {
    drawMoon(canvasRef.current, illumination, phaseIndex);
    addEntry('Moon Phase');
  }, [date, illumination, phaseIndex, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">☾</span>
        <h1 className="font-heading text-2xl font-bold text-text">Moon Phase</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div className="flex items-center justify-center">
              <span className="text-6xl">{phase.icon}</span>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-text">{phase.name}</div>
              <div className="text-xs text-text-secondary mt-1">{d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-lg p-3 border border-border text-center">
                <div className="text-[10px] text-text-tertiary mb-1">Illumination</div>
                <div className="text-lg font-mono font-bold text-text">{illumination.toFixed(1)}%</div>
              </div>
              <div className="bg-surface rounded-lg p-3 border border-border text-center">
                <div className="text-[10px] text-text-tertiary mb-1">Moon Age</div>
                <div className="text-lg font-mono font-bold text-text">{age.toFixed(1)} days</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 flex flex-col items-center gap-4">
            <span className="text-xs text-text-tertiary">Visual Phase</span>
            <canvas ref={canvasRef} width={200} height={200} className="rounded-full" />
            <div className="text-[10px] text-text-secondary text-center">
              Lunar cycle: 29.53 days · Age: {age.toFixed(1)}d / 29.53d
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">All Phases</span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {phaseNames.map((p, i) => (
              <div key={p.name} className={`text-center p-2 rounded-lg border ${i === phaseIndex ? 'border-primary bg-primary/10' : 'border-border bg-surface'}`}>
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="text-[9px] text-text-secondary leading-tight">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
