'use client';
import { useState, useMemo, useEffect } from 'react';
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

function keyOf(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState({});
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const weeks = useMemo(() => buildMonth(year, month), [year, month]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('omnitool-calendar') || '{}');
      if (saved && typeof saved === 'object') setEvents(saved);
    } catch {}
  }, []);

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const openDay = (w) => {
    if (w.other) return;
    const k = keyOf(year, month, w.day);
    setSelected(k);
    setNote(events[k] || '');
  };

  const saveNote = () => {
    if (!selected) return;
    setEvents((prev) => {
      const next = { ...prev };
      if (note.trim()) next[selected] = note.trim();
      else delete next[selected];
      localStorage.setItem('omnitool-calendar', JSON.stringify(next));
      return next;
    });
    setSelected(null);
    setNote('');
  };

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
              const k = w.other ? null : keyOf(year, month, w.day);
              const hasEvent = k && events[k];
              return (
                <div key={i} onClick={() => openDay(w)}
                  className={`relative text-center py-2 rounded-lg text-sm ${
                    w.other ? 'text-text-tertiary/40' :
                    isToday ? 'bg-primary text-white font-bold' :
                    'text-text hover:bg-surface cursor-pointer'
                  }`}>
                  {w.day}
                  {hasEvent && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-primary'}`} />}
                </div>
              );
            })}
          </div>
          {selected && (
            <div className="bg-surface rounded-lg p-3 border border-border/50 space-y-2">
              <div className="text-xs font-medium text-text">{selected}</div>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for this day..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={saveNote} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Save</button>
                <button onClick={() => { setSelected(null); setNote(''); }} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
