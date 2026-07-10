'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toJulian(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function fromJulian(j) {
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const mm = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * mm + 2) / 5) + 1;
  const month = mm + 3 - 12 * Math.floor(mm / 10);
  const year = 100 * b + d - 4800 + Math.floor(mm / 10);
  return { year, month, day };
}

function hebrewYear(y) { return y + 3760; }
function islamicYear(y) { return Math.floor((y - 622) * 33 / 32) + 1; }
function chineseYear(y) {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  return animals[(y - 4) % 12];
}
function zodiacSign(m, d) {
  const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
  const dates = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  return d < dates[m - 1] ? signs[(m - 2 + 12) % 12] : signs[(m - 1) % 12];
}

export default function CalConvertPage() {
  const { addEntry } = useHistory();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());

  const info = useMemo(() => {
    const y = parseInt(year) || 2025;
    const m = parseInt(month) || 1;
    const d = parseInt(day) || 1;
    const jd = toJulian(y, m, d);
    const dow = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
    const doy = Math.ceil((new Date(y, m - 1, d) - new Date(y, 0, 0)) / 86400000);
    return {
      jd, dow, doy,
      hebrew: `${hebrewYear(y)}`,
      islamic: `${islamicYear(y)}`,
      chinese: chineseYear(y),
      zodiac: zodiacSign(m, d),
      week: Math.ceil(doy / 7),
      quarter: Math.ceil(m / 3),
    };
  }, [year, month, day]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">📅</span>
        <h1 className="font-heading text-2xl font-bold text-text">Calendar Converter</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-xs text-text-secondary text-center">Convert a date into multiple calendar systems and cultural references.</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-text-tertiary">Year</label>
              <input type="number" value={year} onChange={(e) => { setYear(e.target.value); addEntry('Calendar Converter'); }}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary">Month</label>
              <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary">Day</label>
              <input type="number" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Day of Week', value: info.dow },
              { label: 'Day of Year', value: info.doy },
              { label: 'Week of Year', value: info.week },
              { label: 'Quarter', value: `Q${info.quarter}` },
              { label: 'Julian Day', value: info.jd },
              { label: 'Hebrew Year', value: info.hebrew },
              { label: 'Islamic Year', value: info.islamic },
              { label: 'Chinese Zodiac', value: info.chinese },
              { label: 'Western Zodiac', value: info.zodiac },
            ].map((item, i) => (
              <div key={i} className="bg-surface rounded-lg px-3 py-2 border border-border/50 flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary">{item.label}</span>
                <span className="text-xs font-medium text-text">{item.value}</span>
              </div>
            ))}
          </div>
          <CopyButton text={`${info.dow}, ${MONTHS[month - 1]} ${day}, ${year} | DOY: ${info.doy} | JD: ${info.jd} | Hebrew: ${info.hebrew} | Chinese: ${info.chinese}`} className="text-xs w-full" />
        </div>
      </GlassCard>
    </motion.div>
  );
}
