'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function getUSWeek(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = (d - start + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}

function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function daysInYear(y) {
  return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
}

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function getQuarter(m) {
  return Math.floor(m / 3) + 1;
}

function weekToDateRange(year, weekNum, iso) {
  const jan1 = new Date(year, 0, 1);
  const dayOffset = iso
    ? (4 - (jan1.getDay() || 7))
    : (1 - jan1.getDay());
  const start = new Date(year, 0, 1 + dayOffset + (weekNum - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export default function WeekNumPage() {
  const { addEntry } = useHistory();
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [weekLookupYear, setWeekLookupYear] = useState(new Date().getFullYear().toString());
  const [weekLookupNum, setWeekLookupNum] = useState('');
  const [weekLookupISO, setWeekLookupISO] = useState(true);

  const dateInfo = useMemo(() => {
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return null;
    const iso = getISOWeek(d);
    const us = getUSWeek(d);
    const doy = getDayOfYear(d);
    const year = d.getFullYear();
    const totalDays = daysInYear(year);
    const remaining = totalDays - doy;
    const q = getQuarter(d.getMonth());
    const leap = isLeapYear(year);
    return {
      isoWeek: iso,
      usWeek: us,
      dayOfYear: doy,
      daysRemaining: remaining,
      quarter: q,
      monthName: monthNames[d.getMonth()],
      dayName: dayNames[d.getDay()],
      leapYear: leap,
      year,
    };
  }, [dateStr]);

  const weekRange = useMemo(() => {
    const y = parseInt(weekLookupYear, 10);
    const w = parseInt(weekLookupNum, 10);
    if (isNaN(y) || isNaN(w) || w < 1 || w > 53) return null;
    const { start, end } = weekToDateRange(y, w, weekLookupISO);
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  }, [weekLookupYear, weekLookupNum, weekLookupISO]);

  const thisWeek = useCallback(() => {
    const now = new Date();
    setDateStr(now.toISOString().split('T')[0]);
    addEntry('Week Number');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">[W]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Week Number Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Select a date</label>
                <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <button onClick={thisWeek}
                className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                &#8592; This Week
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 space-y-4">
              <span className="text-xs text-text-tertiary block">Week Number to Date Range</span>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-text-tertiary mb-1 block">Year</label>
                  <input type="number" value={weekLookupYear} onChange={(e) => setWeekLookupYear(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-text-tertiary mb-1 block">Week #</label>
                  <input type="number" value={weekLookupNum} onChange={(e) => setWeekLookupNum(e.target.value)} min="1" max="53"
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
                <input type="checkbox" checked={weekLookupISO} onChange={(e) => setWeekLookupISO(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer" />
                ISO week numbering
              </label>
              {weekRange && (
                <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-xs font-mono text-text">
                  {weekRange.start} &rarr; {weekRange.end}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {dateInfo && (
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-text font-heading">{dateInfo.monthName} {new Date(dateStr + 'T12:00:00').getDate()}, {dateInfo.year}</div>
                <div className="text-sm text-text-tertiary">{dateInfo.dayName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ISO Week', value: `Week ${dateInfo.isoWeek}` },
                  { label: 'US Week', value: `Week ${dateInfo.usWeek}` },
                  { label: 'Day of Year', value: `${dateInfo.dayOfYear} / ${daysInYear(dateInfo.year)}` },
                  { label: 'Days Remaining', value: dateInfo.daysRemaining },
                  { label: 'Quarter', value: `Q${dateInfo.quarter}` },
                  { label: 'Leap Year', value: dateInfo.leapYear ? 'Yes' : 'No' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <div className="text-xs text-text-tertiary">{label}</div>
                    <div className="text-sm font-mono text-text font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
