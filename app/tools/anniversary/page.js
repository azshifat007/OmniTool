'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function AnniversaryPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('Birthday');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setFullYear(1990);
    return d.toISOString().split('T')[0];
  });
  const [result, setResult] = useState(null);

  const calc = useCallback(() => {
    addEntry('Anniversary Calculator');
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(date + 'T12:00:00');
    const eventThisYear = new Date(today.getFullYear(), event.getMonth(), event.getDate());
    const eventNextYear = new Date(today.getFullYear() + 1, event.getMonth(), event.getDate());
    const diffThis = Math.round((eventThisYear - today) / 86400000);
    const diffNext = Math.round((eventNextYear - today) / 86400000);
    const isToday = today.getMonth() === event.getMonth() && today.getDate() === event.getDate();
    const years = today.getFullYear() - event.getFullYear();

    let nextDate, daysUntil;
    if (diffThis >= 0) {
      nextDate = eventThisYear;
      daysUntil = diffThis;
    } else {
      nextDate = eventNextYear;
      daysUntil = diffNext;
    }

    const baseYears = isToday ? years : years - 1;
    const milestones = [1, 5, 10, 25, 50, 60, 100];
    const nextMilestone = milestones.find((m) => m > baseYears);

    setResult({
      name: name.trim() || 'Event',
      daysUntil,
      isToday,
      years: baseYears,
      nextDate: nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      dayOfWeek: nextDate.toLocaleDateString('en-US', { weekday: 'long' }),
      nextMilestone: nextMilestone ? nextMilestone - baseYears : null,
      milestoneYear: nextMilestone || null,
    });
  }, [name, date, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🎉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Anniversary Calculator</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Find out how many days until the next anniversary of any date.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Event Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <button onClick={calc} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center">
              {result.isToday ? (
                <div className="text-2xl font-bold font-heading text-cat-success">Today! 🎉</div>
              ) : (
                <div className="text-4xl font-bold font-heading text-text">{result.daysUntil} <span className="text-lg text-text-secondary font-normal">days</span></div>
              )}
              <div className="text-sm text-text-secondary">until {result.name}</div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
                  <div className="text-xs text-text-tertiary">Next Date</div>
                  <div className="text-sm font-medium text-text">{result.nextDate}</div>
                </div>
                <div className="bg-surface rounded-xl px-3 py-2.5 border border-border/50">
                  <div className="text-xs text-text-tertiary">{result.isToday ? 'Years' : 'Years Since'}</div>
                  <div className="text-sm font-medium text-text">{result.years}</div>
                </div>
              </div>
              {result.nextMilestone && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
                  <div className="text-xs text-cat-success">Next Milestone</div>
                  <div className="text-sm font-medium text-text">{result.milestoneYear}{result.milestoneYear === 1 ? 'st' : 'th'} anniversary in {result.nextMilestone} year{result.nextMilestone === 1 ? '' : 's'}</div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
