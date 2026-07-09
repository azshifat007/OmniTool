'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildMonth(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const weeks = [];
  let d = 1, n = 1;
  for (let r = 0; r < 6; r++) {
    const week = [];
    for (let c = 0; c < 7; c++) {
      if (r === 0 && c < first) week.push({ day: prevDays - first + c + 1, other: true });
      else if (d > days) week.push({ day: n++, other: true });
      else week.push({ day: d++, other: false });
    }
    weeks.push(week);
    if (d > days && n > 7) break;
  }
  return weeks;
}

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">◰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Calendar</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={prev} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">◀ Prev</button>
            <div className="text-center">
              <div className="font-heading text-lg font-bold text-text">{MONTHS[month]}</div>
              <div className="text-sm text-text-tertiary">{year}</div>
            </div>
            <button onClick={next} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 transition-all cursor-pointer">Next ▶</button>
          </div>
          <button onClick={goToday} className="w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Today</button>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-text-tertiary uppercase py-1">{d}</div>)}
            {weeks.flat().map((w, i) => {
              const isToday = w.day === today.getDate() && month === today.getMonth() && year === today.getFullYear() && !w.other;
              return (
                <div key={i} className={`text-center py-2 rounded-lg text-sm ${
                  w.other ? 'text-text-tertiary/40' :
                  isToday ? 'bg-primary text-white font-bold' :
                  'text-text hover:bg-surface cursor-pointer'
                }`}>{w.day}</div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
