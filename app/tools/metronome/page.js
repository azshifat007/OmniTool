'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const timeSignatures = [
  { label: '2/4', beats: 2, unit: 4 },
  { label: '3/4', beats: 3, unit: 4 },
  { label: '4/4', beats: 4, unit: 4 },
  { label: '5/4', beats: 5, unit: 4 },
  { label: '6/8', beats: 6, unit: 8 },
  { label: '7/8', beats: 7, unit: 8 },
];

export default function MetronomePage() {
  const { addEntry } = useHistory();
  const [bpm, setBpm] = useState(120);
  const [ts, setTs] = useState(timeSignatures[2]);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const audioCtx = useRef(null);
  const timerRef = useRef(null);

  const getCtx = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  };

  const playClick = useCallback((isAccent) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isAccent ? 1000 : 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(isAccent ? 0.8 : 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    setRunning(true);
    setBeat(0);
    playClick(true);

    const interval = 60000 / bpm;
    let count = 0;

    timerRef.current = setInterval(() => {
      count++;
      const b = count % ts.beats;
      setBeat(b);
      playClick(b === 0);
    }, interval);
  }, [bpm, ts.beats, playClick]);

  const stop = useCallback(() => {
    setRunning(false);
    setBeat(-1);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtx.current) audioCtx.current.close();
    };
  }, []);

  const handleBpm = (val) => {
    const v = parseInt(val);
    if (!isNaN(v) && v >= 20 && v <= 300) {
      setBpm(v);
      if (running) { stop(); setTimeout(() => start(), 50); }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♩</span>
        <h1 className="font-heading text-2xl font-bold text-text">Metronome</h1>
      </div>

      <GlassCard>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-text mb-2">{bpm}</div>
            <div className="text-xs text-text-tertiary">BPM</div>
          </div>

          <div>
            <input type="range" min={20} max={300} value={bpm} onChange={(e) => handleBpm(e.target.value)}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-text-secondary"><span>20</span><span>300</span></div>
          </div>

          <div className="flex justify-center gap-2">
            {timeSignatures.map((s) => (
              <button key={s.label} onClick={() => { setTs(s); if (running) { stop(); setTimeout(() => start(), 50); } }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  ts.label === s.label ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>{s.label}</button>
            ))}
          </div>

          <div className="flex justify-center gap-2 min-h-[40px]">
            {Array.from({ length: ts.beats }).map((_, i) => (
              <motion.div key={i} animate={{ scale: beat === i ? [1, 1.3, 1] : 1, opacity: beat === i ? 1 : 0.3 }}
                transition={{ duration: 0.1 }}
                className={`w-8 h-8 rounded-full ${i === 0 ? 'bg-cat-code' : 'bg-primary'} ${beat === i ? '' : 'opacity-30'}`} />
            ))}
          </div>

          <div className="flex justify-center">
            <button onClick={running ? stop : start}
              className={`w-24 h-24 rounded-full text-sm font-bold transition-all cursor-pointer ${
                running ? 'bg-cat-text text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-dark'
              } shadow-lg`}>
              {running ? 'STOP' : 'START'}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
