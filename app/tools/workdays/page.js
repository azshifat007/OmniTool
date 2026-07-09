'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const holidays = [
  { name: "New Year's Day", month: 0, day: 1 },
  { name: 'Martin Luther King Jr. Day', month: 0, day: null, weekday: 1, occurrence: 3 },
  { name: "Presidents' Day", month: 1, day: null, weekday: 1, occurrence: 3 },
  { name: 'Memorial Day', month: 4, day: null, weekday: 1, occurrence: -1 },
  { name: 'Independence Day', month: 6, day: 4 },
  { name: 'Labor Day', month: 8, day: null, weekday: 1, occurrence: 1 },
  { name: 'Columbus Day', month: 9, day: null, weekday: 1, occurrence: 2 },
  { name: 'Veterans Day', month: 10, day: 11 },
  { name: 'Thanksgiving Day', month: 10, day: null, weekday: 4, occurrence: 4 },
  { name: 'Christmas Day', month: 11, day: 25 },
];

function getNthWeekdayOfMonth(year, month, weekday, occurrence) {
  if (occurrence === -1) {
    const last = new Date(year, month + 1, 0);
    let d = last.getDate();
    while (new Date(year, month, d).getDay() !== weekday) d--;
    return new Date(year, month, d, 12, 0, 0, 0);
  }
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d, 12, 0, 0, 0);
    if (date.getMonth() !== month) break;
    if (date.getDay() === weekday) count++;
    if (count === occurrence) return date;
  }
  return null;
}

function getHolidayDates(year) {
  return holidays.map(h => {
    if (h.day !== null) return { ...h, date: new Date(year, h.month, h.day, 12, 0, 0, 0) };
    return { ...h, date: getNthWeekdayOfMonth(year, h.month, h.weekday, h.occurrence) };
  }).filter(h => h.date !== null);
}

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function diffCalendarDays(start, end) {
  const s = startOfDay(start);
  const e = startOfDay(end);
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function WorkdaysPage() {
  const { addEntry } = useHistory();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    setError('');
    if (!start || !end) { setError('Select both start and end dates.'); return; }
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    if (e < s) { setError('End date must be on or after start date.'); return; }

    const totalDays = diffCalendarDays(s, e);

    let weekendDays = 0;
    let businessDaysNoWeekends = 0;
    const current = new Date(s);
    while (current <= e) {
      if (isWeekend(current)) weekendDays++;
      else businessDaysNoWeekends++;
      current.setDate(current.getDate() + 1);
    }

    const holidayDates = getHolidayDates(s.getFullYear());
    const nextYearHolidays = s.getFullYear() !== e.getFullYear() ? getHolidayDates(e.getFullYear()) : [];
    const allHolidays = [...holidayDates, ...nextYearHolidays];

    const holidaysInRange = [];
    const current2 = new Date(s);
    while (current2 <= e) {
      for (const h of allHolidays) {
        if (isSameDay(current2, h.date) && !holidaysInRange.some(x => isSameDay(x.date, current2))) {
          holidaysInRange.push({ name: h.name, date: new Date(current2) });
        }
      }
      current2.setDate(current2.getDate() + 1);
    }

    let businessDaysNoHolidays = businessDaysNoWeekends;
    holidaysInRange.forEach(h => {
      if (!isWeekend(h.date)) businessDaysNoHolidays--;
    });

    setResult({ totalDays, weekendDays, businessDaysNoWeekends, businessDaysNoHolidays, holidaysInRange });
    addEntry('Business Days Calculator');
  }, [start, end, excludeWeekends, excludeHolidays, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">[~]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Business Days Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Start Date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">End Date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={excludeWeekends} onChange={(e) => setExcludeWeekends(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary" />
              <span className="text-sm text-text">Exclude weekends</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={excludeHolidays} onChange={(e) => setExcludeHolidays(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface accent-primary" />
              <span className="text-sm text-text">Exclude US federal holidays</span>
            </label>
            <button onClick={calculate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate
            </button>
          </div>
        </GlassCard>

        {result && (
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="text-xs text-text-tertiary">Results</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Calendar Days', value: result.totalDays },
                  { label: 'Weekend Days', value: result.weekendDays },
                  { label: 'Business Days (excl. weekends)', value: result.businessDaysNoWeekends },
                  { label: 'Business Days (excl. weekends + holidays)', value: result.businessDaysNoHolidays },
                  { label: 'Holidays in Range', value: result.holidaysInRange.length },
                ].map(({ label, value }) => (
                  <div key={label} className={`bg-surface rounded-lg px-3 py-2 border border-border/50 ${label === 'Business Days (excl. weekends + holidays)' || label === 'Business Days (excl. weekends)' ? 'col-span-2' : ''}`}>
                    <div className="text-[10px] text-text-tertiary">{label}</div>
                    <div className="text-sm font-mono text-text font-bold">{value}</div>
                  </div>
                ))}
              </div>
              {result.holidaysInRange.length > 0 && (
                <div>
                  <div className="text-xs text-text-tertiary mb-2">Holiday Dates</div>
                  <div className="space-y-1">
                    {result.holidaysInRange.map((h, i) => (
                      <div key={i} className="bg-surface rounded-lg px-3 py-1.5 text-xs font-mono text-text-tertiary border border-border/50 flex justify-between">
                        <span>{h.name}</span>
                        <span>{h.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
