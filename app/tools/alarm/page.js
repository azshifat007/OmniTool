'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const ringSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 2);
    return { ctx, osc };
  } catch {
    return null;
  }
};

export default function AlarmPage() {
  const { addEntry } = useHistory();
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d.toTimeString().slice(0, 5);
  });
  const [label, setLabel] = useState('Wake up!');
  const [alarms, setAlarms] = useState([]);
  const [ringing, setRinging] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (audioRef.current) {
      try { audioRef.current.osc.stop(); } catch {}
      try { audioRef.current.ctx.close(); } catch {}
      audioRef.current = null;
    }
  }, []);

  const armAlarm = useCallback((alarm) => {
    const [h, m] = alarm.time.split(':').map(Number);
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    timerRef.current = setTimeout(() => {
      setRinging(alarm);
      audioRef.current = ringSound();
    }, diff);
  }, []);

  const addAlarm = useCallback(() => {
    addEntry('Alarm Clock');
    const alarm = { id: Date.now(), time, label: label.trim() || 'Alarm', enabled: true };
    setAlarms((prev) => [...prev, alarm]);
    armAlarm(alarm);
  }, [time, label, addEntry, armAlarm]);

  const removeAlarm = useCallback((id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const snooze = useCallback(() => {
    clearTimers();
    const snoozed = { ...ringing, time: (() => {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 5);
      return d.toTimeString().slice(0, 5);
    })() };
    setAlarms((prev) => prev.map((a) => a.id === ringing.id ? snoozed : a));
    setRinging(null);
    armAlarm(snoozed);
  }, [ringing, clearTimers, armAlarm]);

  const stopAlarm = useCallback(() => {
    clearTimers();
    setRinging(null);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⏰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Alarm Clock</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Set one-time alarms that ring at the specified time.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-2xl text-text border border-border focus:border-primary focus:outline-none transition-colors text-center font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
          </div>
          {!ringing ? (
            <button onClick={addAlarm}
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer bg-primary text-white hover:bg-primary-dark">
              Add Alarm
            </button>
          ) : (
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="space-y-3">
              <div className="text-2xl font-bold text-cat-text">{ringing.label || 'Alarm!'}</div>
              <div className="flex gap-3 justify-center">
                <button onClick={stopAlarm} className="px-8 py-3 text-sm font-bold rounded-xl bg-cat-text text-white hover:opacity-90 transition-all cursor-pointer">STOP</button>
                <button onClick={snooze} className="px-6 py-3 text-sm font-bold rounded-xl bg-surface border border-border text-text hover:text-text transition-all cursor-pointer">SNOOZE</button>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {alarms.length > 0 && (
        <GlassCard className="mt-5">
          <div className="p-4 space-y-2">
            <div className="text-xs text-text-tertiary mb-1">Active Alarms ({alarms.length})</div>
            {alarms.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 border border-border/50">
                <div className="text-left">
                  <div className="text-sm font-mono text-text font-bold">{a.time}</div>
                  <div className="text-xs text-text-secondary">{a.label}</div>
                </div>
                <button onClick={() => removeAlarm(a.id)}
                  className="text-xs px-2 py-1 rounded bg-cat-text/10 text-cat-text hover:opacity-80 transition-all cursor-pointer">Remove</button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
