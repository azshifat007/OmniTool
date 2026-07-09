'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
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
  for (const z of zodiacSigns) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (sm === em) {
      if (month === sm && day >= sd && day <= ed) return z;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
    }
  }
  return zodiacSigns[0];
}

const chineseZodiac = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

function getChineseZodiac(year) {
  return chineseZodiac[(year - 4) % 12];
}

function daysUntilNextBirthday(birthMonth, birthDay, now) {
  const currentYear = now.getFullYear();
  const next = new Date(currentYear, birthMonth - 1, birthDay);
  if (next <= now) next.setFullYear(currentYear + 1);
  return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
}

export default function AgePage() {
  const { addEntry } = useHistory();
  const [birth, setBirth] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);

  const calculate = useCallback(() => {
    if (!birth) return;
    const birthDate = new Date(birth);
    const targetDate = target ? new Date(target) : new Date();

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return;

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMs = targetDate - birthDate;
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
    const totalMonths = years * 12 + months;

    const zodiac = getZodiac(birthDate.getMonth() + 1, birthDate.getDate());
    const chinese = getChineseZodiac(birthDate.getFullYear());
    const nextBirthday = daysUntilNextBirthday(birthDate.getMonth() + 1, birthDate.getDate(), targetDate);

    setResult({
      years, months, days,
      totalMonths, totalWeeks, totalDays, totalHours,
      zodiac, chinese, nextBirthday,
    });
    addEntry('Age Calculator');
  }, [birth, target, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🎂</span>
        <h1 className="font-heading text-2xl font-bold text-text">Age Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Birth Date</label>
              <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Target Date (optional, defaults to today)</label>
              <input type="date" value={target} onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <button onClick={calculate}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate
            </button>
          </div>
        </GlassCard>

        {result && (
          <GlassCard>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <span className="text-4xl">{result.zodiac.emoji}</span>
                <div className="text-3xl font-bold text-text mt-1">
                  {result.years}y {result.months}m {result.days}d
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Months', value: result.totalMonths },
                  { label: 'Total Weeks', value: result.totalWeeks },
                  { label: 'Total Days', value: result.totalDays },
                  { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <div className="text-xs text-text-tertiary">{label}</div>
                    <div className="text-sm font-mono text-text font-bold">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Next Birthday', value: `in ${result.nextBirthday} days` },
                  { label: 'Zodiac Sign', value: `${result.zodiac.emoji} ${result.zodiac.name}` },
                  { label: 'Chinese Zodiac', value: result.chinese },
                ].map(({ label, value }) => (
                  <div key={label} className={`bg-surface rounded-lg px-3 py-2 border border-border/50 ${label === 'Chinese Zodiac' || label === 'Zodiac Sign' ? 'col-span-1' : 'col-span-2'}`}>
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
