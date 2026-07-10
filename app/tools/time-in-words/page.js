'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const NUM_WORDS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

function timeToWords(h, m) {
  const hour = h % 12;
  const nextHour = (h + 1) % 12;
  const hourWord = NUM_WORDS[hour] || NUM_WORDS[12];
  const nextHourWord = NUM_WORDS[nextHour] || NUM_WORDS[12];
  const ampm = h < 12 ? 'AM' : 'PM';

  if (m === 0) return `${hourWord.toUpperCase()} o'clock ${ampm}`;
  if (m === 15) return `QUARTER PAST ${hourWord.toUpperCase()} ${ampm}`;
  if (m === 30) return `HALF PAST ${hourWord.toUpperCase()} ${ampm}`;
  if (m === 45) return `QUARTER TO ${nextHourWord.toUpperCase()} ${ampm}`;

  const minsWord = m <= 20 ? NUM_WORDS[m]?.toUpperCase() : `${TENS[Math.floor(m / 10)]?.toUpperCase()} ${NUM_WORDS[m % 10]?.toUpperCase() || ''}`.trim();
  if (m < 30) return `${minsWord} PAST ${hourWord.toUpperCase()} ${ampm}`;
  const remain = 60 - m;
  const remainWord = remain <= 20 ? NUM_WORDS[remain]?.toUpperCase() : `${TENS[Math.floor(remain / 10)]?.toUpperCase()} ${NUM_WORDS[remain % 10]?.toUpperCase() || ''}`.trim();
  return `${remainWord} TO ${nextHourWord.toUpperCase()} ${ampm}`;
}

export default function TimeInWordsPage() {
  const { addEntry } = useHistory();
  const [time, setTime] = useState(() => {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
  });
  const [result, setResult] = useState('');

  const convert = useCallback(() => {
    addEntry('Time in Words');
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    setResult(timeToWords(h, m));
  }, [time, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">⏰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Time in Words</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Convert digital time to human-readable words.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-2xl text-text border border-border focus:border-primary focus:outline-none transition-colors text-center font-mono" />
          </div>
          <button onClick={convert} className="px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
              <div className="text-2xl font-bold font-heading text-text">{result}</div>
              <div className="text-xs text-text-tertiary mt-1">= {time}</div>
              <div className="flex justify-center mt-3"><CopyButton text={result} className="text-xs" /></div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
