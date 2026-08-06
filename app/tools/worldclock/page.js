'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const defaultTimezones = [
  { city: 'UTC', tz: 'UTC', label: 'UTC ±00:00' },
  { city: 'London', tz: 'Europe/London', label: 'GMT/BST' },
  { city: 'New York', tz: 'America/New_York', label: 'EST/EDT' },
  { city: 'Chicago', tz: 'America/Chicago', label: 'CST/CDT' },
  { city: 'Denver', tz: 'America/Denver', label: 'MST/MDT' },
  { city: 'Los Angeles', tz: 'America/Los_Angeles', label: 'PST/PDT' },
  { city: 'Berlin', tz: 'Europe/Berlin', label: 'CET/CEST' },
  { city: 'Paris', tz: 'Europe/Paris', label: 'CET/CEST' },
  { city: 'Moscow', tz: 'Europe/Moscow', label: 'MSK' },
  { city: 'Dubai', tz: 'Asia/Dubai', label: 'GST' },
  { city: 'Mumbai', tz: 'Asia/Kolkata', label: 'IST' },
  { city: 'Shanghai', tz: 'Asia/Shanghai', label: 'CST' },
  { city: 'Singapore', tz: 'Asia/Singapore', label: 'SGT' },
  { city: 'Tokyo', tz: 'Asia/Tokyo', label: 'JST' },
  { city: 'Sydney', tz: 'Australia/Sydney', label: 'AEST/AEDT' },
];

function formatTime(tz) {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const ampm = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    hour12: true,
  }).format(now).slice(-2);

  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';

  return { time, ampm, date, offset };
}

function getOffsetMinutes(tz) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' });
  const parts = formatter.formatToParts(now);
  const off = parts.find(p => p.type === 'timeZoneName')?.value || '';
  const m = off.match(/([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  const hrs = parseInt(m[2]);
  const min = m[3] ? parseInt(m[3]) : 0;
  return (m[1] === '+' ? 1 : -1) * (hrs * 60 + min);
}

function customToTz(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const label = `UTC${sign}${h}${m ? `:${m.toString().padStart(2, '0')}` : ':00'}`;
  return { city: label, tz: label, label: label, custom: true, offsetMinutes };
}

function formatCustomTime(city, offsetMinutes) {
  const utc = new Date();
  const local = new Date(utc.getTime() + offsetMinutes * 60000 + utc.getTimezoneOffset() * 60000);
  const time = local.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const ampm = local.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).slice(-2);
  const date = local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return { time, ampm, date, offset: city };
}

export default function WorldClockPage() {
  const { addEntry } = useHistory();
  const [customs, setCustoms] = useState([]);
  const [customOffset, setCustomOffset] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const allTimezones = [...defaultTimezones, ...customs];

  const addCustom = useCallback(() => {
    const val = customOffset.trim();
    const m = val.match(/^([+-])?(\d+)(?::(\d+))?$/);
    if (!m) return;
    const sign = m[1] === '-' ? -1 : 1;
    let total = sign * parseInt(m[2]) * 60;
    if (m[3]) total += sign * parseInt(m[3]);
    const entry = customToTz(total);
    setCustoms(prev => [...prev, entry]);
    setCustomOffset('');
    addEntry('World Clock');
  }, [customOffset, addEntry]);

  const removeCustom = useCallback((index) => {
    setCustoms(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">[*]</span>
        <h1 className="font-heading text-2xl font-bold text-text">World Clock</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Add custom timezone offset (e.g. +5:30, -3, +8:45)</label>
          <div className="flex gap-2">
            <input value={customOffset} onChange={(e) => setCustomOffset(e.target.value)} placeholder="e.g. +5:30"
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={addCustom} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Add</button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allTimezones.map((loc, i) => {
          const fmt = loc.custom
            ? formatCustomTime(loc.city, loc.offsetMinutes)
            : formatTime(loc.tz);
          return (
            <GlassCard key={`${loc.city}-${i}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-text">{loc.city}</span>
                    <span className="text-[10px] text-text-tertiary block">{loc.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {loc.custom && (
                      <button onClick={() => removeCustom(i - defaultTimezones.length)}
                        className="text-[10px] text-cat-text hover:text-text transition-colors cursor-pointer px-1">&times;</button>
                    )}
                    <CopyButton text={`${loc.city}: ${fmt.time} ${fmt.ampm} ${fmt.date}`} />
                  </div>
                </div>
                <div className="bg-surface rounded-lg px-3 py-3 text-center border border-border/50">
                  <div className="text-2xl font-mono font-bold text-text tracking-wider">{fmt.time}</div>
                  <div className="text-xs text-text-tertiary mt-1">
                    {fmt.ampm} &middot; {fmt.date}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}
