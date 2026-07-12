'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function pad(n) { return n.toString().padStart(2, '0'); }

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const PRESETS = {
  classic: { work: 25, shortBreak: 5, longBreak: 15 },
  short: { work: 15, shortBreak: 3, longBreak: 10 },
  long: { work: 50, shortBreak: 10, longBreak: 20 },
  custom: { work: 25, shortBreak: 5, longBreak: 15 },
};

function getPhases(durations) {
  return {
    work: { label: 'Focus', duration: durations.work * 60, color: 'var(--primary)' },
    shortBreak: { label: 'Short Break', duration: durations.shortBreak * 60, color: 'var(--cat-success)' },
    longBreak: { label: 'Long Break', duration: durations.longBreak * 60, color: 'var(--cat-code)' },
  };
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('omnitool-pomo-stats') || '{"sessions":0,"totalFocus":0,"days":{}}');
  } catch { return { sessions: 0, totalFocus: 0, days: {} }; }
}

function saveStats(stats) {
  localStorage.setItem('omnitool-pomo-stats', JSON.stringify(stats));
}

export default function PomodoroPage() {
  const { addEntry } = useHistory();
  const [preset, setPreset] = useState('classic');
  const [customDurations, setCustomDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [phase, setPhase] = useState('work');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState(loadStats);
  const [completedToday, setCompletedToday] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return loadStats().days[today] || 0;
  });
  const [dailyGoal, setDailyGoal] = useState(() => {
    try { return parseInt(localStorage.getItem('omnitool-pomo-goal') || '8'); } catch { return 8; }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef(null);

  const durations = preset === 'custom' ? customDurations : PRESETS[preset];
  const PHASES = getPhases(durations);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('omnitool-pomo-goal', String(dailyGoal)); } catch {}
  }, [dailyGoal]);

  const recordSession = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      const newDays = { ...prev.days, [today]: (prev.days[today] || 0) + 1 };
      const newStats = { sessions: prev.sessions + 1, totalFocus: prev.totalFocus + durations.work * 60, days: newDays };
      saveStats(newStats);
      return newStats;
    });
    setCompletedToday(prev => prev + 1);
  }, [durations.work]);

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          if (soundEnabled) beep();
          if (phase === 'work') recordSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phase, soundEnabled, recordSession]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    if (phase === 'work') {
      const isLongBreak = count >= 3;
      const nextPhase = isLongBreak ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setRemaining(PHASES[nextPhase].duration);
      setCount(prev => isLongBreak ? 0 : prev + 1);
    } else {
      setPhase('work');
      setRemaining(PHASES.work.duration);
    }
  }, [phase, count, PHASES]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPhase('work');
    setRemaining(PHASES.work.duration);
    setCount(0);
  }, [PHASES]);

  const switchPreset = useCallback((p) => {
    if (running) return;
    setPreset(p);
    setPhase('work');
    const d = p === 'custom' ? customDurations : PRESETS[p];
    setRemaining(d.work * 60);
    setCount(0);
  }, [running, customDurations]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
      if (e.code === 'KeyS') skip();
      if (e.code === 'KeyR') reset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, start, pause, skip, reset]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const total = PHASES[phase].duration;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const goalPct = dailyGoal > 0 ? Math.min((completedToday / dailyGoal) * 100, 100) : 0;

  const totalSessions = stats.sessions;
  const totalHours = (stats.totalFocus / 3600).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⏲</span>
        <h1 className="font-heading text-2xl font-bold text-text">Pomodoro Timer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-4 space-y-5">
              <div className="flex justify-center gap-2 flex-wrap">
                {Object.keys(PRESETS).map(p => (
                  <button key={p} onClick={() => switchPreset(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer capitalize ${
                      preset === p ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40 disabled:opacity-40'
                    }`}>{p}</button>
                ))}
              </div>

              {preset === 'custom' && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'work', label: 'Focus (min)' },
                    { key: 'shortBreak', label: 'Short (min)' },
                    { key: 'longBreak', label: 'Long (min)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-[10px] text-text-tertiary mb-1 block">{label}</label>
                      <input type="number" min={1} max={120} value={customDurations[key]}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setCustomDurations(d => ({ ...d, [key]: val }));
                          if (key === 'work' && phase === 'work' && !running) setRemaining(val * 60);
                        }}
                        className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center">
                <div className="text-7xl font-mono font-bold tracking-widest text-text tabular-nums">
                  {pad(m)}:{pad(s)}
                </div>
                <div className="text-sm text-text-tertiary mt-1">
                  {PHASES[phase].label} {count > 0 && `· #${count + 1}`}
                </div>
              </div>

              <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%`, backgroundColor: PHASES[phase].color }} />
              </div>

              <div className="flex justify-center gap-2">
                {!running ? (
                  <button onClick={start} disabled={remaining <= 0}
                    className="px-5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    {remaining === total ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button onClick={pause}
                    className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                    Pause
                  </button>
                )}
                <button onClick={skip}
                  className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                  Skip
                </button>
                <button onClick={reset}
                  className="px-5 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">
                  Reset
                </button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)}
                    className="w-3.5 h-3.5 rounded border-border bg-surface accent-primary" />
                  <span className="text-[10px] text-text-secondary">Sound</span>
                </label>
                <span className="text-[10px] text-text-tertiary">Space: play/pause · S: skip · R: reset</span>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Today&apos;s Progress</span>
                <span className="text-xs text-text-secondary">{completedToday}/{dailyGoal}</span>
              </div>
              <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-border/50">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goalPct}%` }} />
              </div>
              <div>
                <label className="text-[10px] text-text-tertiary mb-1 block">Daily Goal</label>
                <input type="range" min={1} max={20} value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary">All-Time Stats</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-center">
                  <div className="text-lg font-bold font-heading text-text">{totalSessions}</div>
                  <div className="text-[10px] text-text-tertiary">Sessions</div>
                </div>
                <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-center">
                  <div className="text-lg font-bold font-heading text-text">{totalHours}h</div>
                  <div className="text-[10px] text-text-tertiary">Focus Time</div>
                </div>
              </div>
              {Object.keys(stats.days).length > 0 && (
                <div className="text-[10px] text-text-secondary text-center">
                  Best day: {Math.max(...Object.values(stats.days))} sessions
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-2 block">Session Breakdown</span>
              <div className="space-y-1.5">
                {[
                  { label: 'Focus', duration: durations.work, color: 'bg-primary' },
                  { label: 'Short Break', duration: durations.shortBreak, color: 'bg-cat-success' },
                  { label: 'Long Break', duration: durations.longBreak, color: 'bg-cat-code' },
                ].map(({ label, duration, color }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px]">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-text-secondary flex-1">{label}</span>
                    <span className="font-mono text-text">{duration}m</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
