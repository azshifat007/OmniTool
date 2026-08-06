'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const timezones = [
  { label: 'Local', tz: 'local' },
  { label: 'UTC', tz: 'UTC' },
  { label: 'New York', tz: 'America/New_York' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Paris', tz: 'Europe/Paris' },
  { label: 'Dubai', tz: 'Asia/Dubai' },
  { label: 'Singapore', tz: 'Asia/Singapore' },
  { label: 'Mumbai', tz: 'Asia/Kolkata' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  { label: 'Berlin', tz: 'Europe/Berlin' },
  { label: 'Shanghai', tz: 'Asia/Shanghai' },
  { label: 'Moscow', tz: 'Europe/Moscow' },
  { label: 'São Paulo', tz: 'America/Sao_Paulo' },
];

function drawClock(canvas, tz) {
  const ctx = canvas.getContext('2d');
  const d = tz === 'local' ? new Date() : new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const hours = d.getHours() % 12;
  const mins = d.getMinutes();
  const secs = d.getSeconds();
  const size = Math.min(canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = size * 0.42;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#1E293B'; ctx.fill();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isHour = i % 5 === 0;
    const inner = r * (isHour ? 0.85 : 0.92);
    const outer = r * 0.96;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.strokeStyle = isHour ? '#E2E8F0' : '#475569';
    ctx.lineWidth = isHour ? 2.5 : 1; ctx.stroke();
  }

  for (let i = 1; i <= 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r * 0.72;
    const y = cy + Math.sin(angle) * r * 0.72;
    ctx.fillStyle = '#E2E8F0'; ctx.font = `bold ${r * 0.14}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(i.toString(), x, y);
  }

  const hAngle = (hours / 12 + mins / 720) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hAngle) * r * 0.5, cy + Math.sin(hAngle) * r * 0.5);
  ctx.strokeStyle = '#818CF8'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();

  const mAngle = (mins / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(mAngle) * r * 0.72, cy + Math.sin(mAngle) * r * 0.72);
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();

  const sAngle = (secs / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(cx - Math.cos(sAngle) * r * 0.12, cy - Math.sin(sAngle) * r * 0.12);
  ctx.lineTo(cx + Math.cos(sAngle) * r * 0.82, cy + Math.sin(sAngle) * r * 0.82);
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.stroke();

  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444'; ctx.fill();
}

export default function AnalogClockPage() {
  const { addEntry } = useHistory();
  const canvasRef = useRef(null);
  const [tz, setTz] = useState('local');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    addEntry('Analog Clock');
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = Math.min(parent?.clientWidth || 300, 350);
      canvas.width = w; canvas.height = w;
      drawClock(canvas, tz);
      const d = tz === 'local' ? new Date() : new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
      setTimeStr(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tz === 'local' ? undefined : tz }));
    }, 200);
    return () => clearInterval(interval);
  }, [tz, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🕐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Analog Clock</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Timezone</label>
          <select value={tz} onChange={e => setTz(e.target.value)}
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
            {timezones.map(t => <option key={t.tz} value={t.tz}>{t.label}</option>)}
          </select>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4 flex flex-col items-center">
          <canvas ref={canvasRef} className="max-w-[350px] w-full" />
          {timeStr && (
            <div className="mt-3 text-lg font-mono text-text font-bold">{timeStr}</div>
          )}
          {timeStr && (
            <div className="text-xs text-text-tertiary">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz === 'local' ? undefined : tz })}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
