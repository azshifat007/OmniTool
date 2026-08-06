'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const timezones = [
  { label: 'UTC (UTC+0)', value: 'UTC' },
  { label: 'GMT (UTC+0)', value: 'GMT' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'CST (UTC-6)', value: 'America/Chicago' },
  { label: 'MST (UTC-7)', value: 'America/Denver' },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'AKST (UTC-9)', value: 'America/Anchorage' },
  { label: 'HST (UTC-10)', value: 'Pacific/Honolulu' },
  { label: 'CET (UTC+1)', value: 'Europe/Paris' },
  { label: 'EET (UTC+2)', value: 'Europe/Helsinki' },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'CST China (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'AEST (UTC+10)', value: 'Australia/Sydney' },
  { label: 'NZST (UTC+12)', value: 'Pacific/Auckland' },
  { label: 'BRT (UTC-3)', value: 'America/Sao_Paulo' },
  { label: 'WAT (UTC+1)', value: 'Africa/Lagos' },
  { label: 'CAT (UTC+2)', value: 'Africa/Harare' },
  { label: 'GST (UTC+4)', value: 'Asia/Dubai' },
  { label: 'PKT (UTC+5)', value: 'Asia/Karachi' },
];

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

function formatDiff(fromMin, toMin) {
  const diff = toMin - fromMin;
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const dir = diff >= 0 ? 'ahead of' : 'behind';
  const hStr = h ? `${h}h` : '';
  const mStr = m ? `${m}m` : '';
  const gap = h && m ? '' : '';
  return `${hStr}${gap}${mStr} ${dir}`;
}

export default function TimezonePage() {
  const { addEntry } = useHistory();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('Asia/Kolkata');
  const [converted, setConverted] = useState(null);

  const convert = useCallback(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;

    const fromOpts = { timeZone: fromTz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const toOpts = { timeZone: toTz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const utcOpts = { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const fromStr = new Intl.DateTimeFormat('en-US', fromOpts).format(d);
    const toStr = new Intl.DateTimeFormat('en-US', toOpts).format(d);
    const utcStr = new Intl.DateTimeFormat('en-US', utcOpts).format(d);

    const fromMin = getOffsetMinutes(fromTz);
    const toMin = getOffsetMinutes(toTz);
    const diffStr = formatDiff(fromMin, toMin);

    const sign = (off) => {
      const abs = Math.abs(off);
      const h = Math.floor(abs / 60);
      const m = abs % 60;
      return `UTC${off >= 0 ? '+' : '-'}${h}${m ? `:${m.toString().padStart(2, '0')}` : ''}`;
    };

    setConverted({ fromStr, toStr, utcStr, fromOffset: sign(fromMin), toOffset: sign(toMin), diffStr });
    addEntry('Timezone Converter');
  }, [date, fromTz, toTz, addEntry]);

  const fromTzLabel = useMemo(() => timezones.find(t => t.value === fromTz)?.label || fromTz, [fromTz]);
  const toTzLabel = useMemo(() => timezones.find(t => t.value === toTz)?.label || toTz, [toTz]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🕐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Timezone Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Date & Time</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">From Timezone</label>
              <select value={fromTz} onChange={(e) => setFromTz(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">To Timezone</label>
              <select value={toTz} onChange={(e) => setToTz(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <button onClick={convert} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          {converted && (
            <>
              <GlassCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">Source Time ({fromTzLabel})</span>
                    <CopyButton text={converted.fromStr} />
                  </div>
                  <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                    <span className="text-sm text-text">{converted.fromStr}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-tertiary">Target Time ({toTzLabel})</span>
                    <CopyButton text={converted.toStr} />
                  </div>
                  <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                    <span className="text-sm text-text">{converted.toStr}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-4 space-y-2">
                  <span className="text-xs text-text-tertiary block">UTC Equivalent</span>
                  <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <span className="text-sm font-mono text-text">{converted.utcStr}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-xs text-text-secondary">{fromTzLabel}: {converted.fromOffset}</div>
                    <div className="text-xs text-text-secondary">{toTzLabel}: {converted.toOffset}</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs text-text text-center">
                    {converted.toOffset} is {converted.diffStr} {converted.fromOffset}
                  </div>
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
