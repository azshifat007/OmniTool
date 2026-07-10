'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const zodiacSigns = [
  { name: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
  { name: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
  { name: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
  { name: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
];

function getZodiac(month, day) {
  for (const sign of zodiacSigns) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) return sign;
    if (sm > em && (month === sm || (month === 1 && day <= ed))) return sign;
  }
  return zodiacSigns[0];
}

function getChineseZodiac(year) {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  return animals[(year - 4) % 12];
}

function calcAge(birthDate, now) {
  let years = now.getFullYear() - birthDate.getFullYear();
  const mDiff = now.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < birthDate.getDate())) years--;
  return years;
}

export default function BirthdayCountdownPage() {
  const { addEntry } = useHistory();
  const [day, setDay] = useState('15');
  const [month, setMonth] = useState('6');
  const [year, setYear] = useState('1990');

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => ({ m: now.getMonth() + 1, d: now.getDate(), y: now.getFullYear() }), []);

  const info = useMemo(() => {
    const d = parseInt(day); const m = parseInt(month); const y = parseInt(year);
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12) return null;
    const birthDate = new Date(y, m - 1, d);
    const age = calcAge(birthDate, now);
    const nextBirthday = new Date(today.y, m - 1, d);
    if (nextBirthday < now) nextBirthday.setFullYear(today.y + 1);
    const diff = nextBirthday - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const zodiac = getZodiac(m, d);
    const chinese = getChineseZodiac(y);
    const totalDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
    const isToday = d === today.d && m === today.m;
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][birthDate.getDay()];
    const nextDow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextBirthday.getDay()];
    addEntry('Birthday Countdown');
    return { age, daysLeft, hoursLeft, minsLeft, zodiac, chinese, totalDays, isToday, dayOfWeek, nextDow, nextBirthday };
  }, [day, month, year, now, today, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🎂</span>
        <h1 className="font-heading text-2xl font-bold text-text">Birthday Countdown</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Day</label>
                <input type="number" min={1} max={31} value={day} onChange={e => setDay(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Month</label>
                <input type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Year</label>
                <input type="number" min={1900} max={2025} value={year} onChange={e => setYear(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </GlassCard>

        {info && (
          <div className="space-y-5">
            {info.isToday && (
              <GlassCard>
                <div className="p-4 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-lg text-text font-bold">Happy Birthday!</div>
                  <div className="text-xs text-text-tertiary mt-1">You turned {info.age} today!</div>
                </div>
              </GlassCard>
            )}
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Countdown to next birthday</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <div className="text-2xl font-bold font-heading text-cat-date">{info.daysLeft}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">Days</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <div className="text-2xl font-bold font-heading text-cat-date">{info.hoursLeft}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">Hours</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 border border-border">
                    <div className="text-2xl font-bold font-heading text-cat-date">{info.minsLeft}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">Minutes</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Birthday Stats</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Age', value: `${info.age} years` },
                    { label: 'Born on', value: `${info.dayOfWeek}` },
                    { label: 'Next birthday', value: info.nextDow },
                    { label: 'Days on Earth', value: info.totalDays.toLocaleString() },
                    { label: 'Zodiac', value: `${info.zodiac.emoji} ${info.zodiac.name}` },
                    { label: 'Chinese Zodiac', value: info.chinese },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-xs text-text-tertiary">{label}</div>
                      <div className="text-sm font-medium text-text">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </motion.div>
  );
}
