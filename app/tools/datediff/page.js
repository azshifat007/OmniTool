'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function floorDiv(a, b) {
  return Math.floor(a / b);
}

export default function DateDiffPage() {
  const { addEntry } = useHistory();
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [includeEnd, setIncludeEnd] = useState(false);
  const [error, setError] = useState('');

  const result = useMemo(() => {
    setError('');
    if (!startDate || !endDate) { setError('Select both start and end dates.'); return null; }

    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { setError('Invalid date.'); return null; }

    let diffMs = Math.abs(d2.getTime() - d1.getTime());
    if (includeEnd) diffMs += 86400000;

    const totalSeconds = floorDiv(diffMs, 1000);
    const totalMinutes = floorDiv(totalSeconds, 60);
    const totalHours = floorDiv(totalMinutes, 60);
    const totalDays = floorDiv(totalHours, 24);
    const totalWeeks = totalDays / 7;

    const later = d2 > d1 ? 'End' : 'Start';
    const earlier = d2 > d1 ? 'Start' : 'End';

    let years = 0, months = 0, days = 0;
    const earlierDate = d2 > d1 ? new Date(d1) : new Date(d2);
    const laterDate = d2 > d1 ? new Date(d2) : new Date(d1);

    years = laterDate.getFullYear() - earlierDate.getFullYear();
    earlierDate.setFullYear(earlierDate.getFullYear() + years);

    if (earlierDate > laterDate) {
      years--;
      earlierDate.setFullYear(earlierDate.getFullYear() - 1);
    }

    months = laterDate.getMonth() - earlierDate.getMonth();
    earlierDate.setMonth(earlierDate.getMonth() + months);

    if (earlierDate > laterDate) {
      months--;
      earlierDate.setMonth(earlierDate.getMonth() - 1);
    }

    days = Math.floor((laterDate.getTime() - earlierDate.getTime()) / 86400000);

    addEntry('Date Difference Calculator');
    return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, totalSeconds, later, earlier };
  }, [startDate, endDate, includeEnd, addEntry]);

  const results = useMemo(() => {
    if (!result) return null;
    return [
      { label: 'Years, Months, Days', value: `${result.years}y ${result.months}m ${result.days}d` },
      { label: 'Total Days', value: result.totalDays.toLocaleString() },
      { label: 'Total Weeks', value: result.totalWeeks.toFixed(1) },
      { label: 'Total Hours', value: result.totalHours.toLocaleString() },
      { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
      { label: 'Total Seconds', value: result.totalSeconds.toLocaleString() },
    ];
  }, [result]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">📅</span>
        <h1 className="font-heading text-2xl font-bold text-text">Date Difference Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeEnd} onChange={() => setIncludeEnd(!includeEnd)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary" />
              <span className="text-sm text-text">Include end date in calculation</span>
            </label>
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">Clear Dates</button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today → +1w', s: new Date().toISOString().split('T')[0], e: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] },
                { label: 'Today → +1y', s: new Date().toISOString().split('T')[0], e: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] },
                { label: 'Swap', swap: true },
              ].map((p, i) => (
                <button key={i} onClick={() => p.swap ? (setStartDate(endDate), setEndDate(startDate)) : (setStartDate(p.s), setEndDate(p.e))}
                  className="px-2 py-1.5 text-[10px] font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{p.label}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        {results && (
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Results</span>
                <CopyButton text={results.map(r => `${r.label}: ${r.value}`).join('\n')} />
              </div>
              <div className="space-y-2">
                {results.map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 flex items-center justify-between border border-border/50">
                    <span className="text-xs text-text-tertiary">{label}</span>
                    <span className="text-sm font-mono text-text">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-primary/10 rounded-lg px-3 py-2 text-xs text-text text-center">
                {result.later} date is later than {result.earlier} date
              </div>
            </div>
          </GlassCard>
        )}
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
