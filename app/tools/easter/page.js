'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function EasterPage() {
  const { addEntry } = useHistory();
  const [year, setYear] = useState(new Date().getFullYear());
  const [orthodox, setOrthodox] = useState(false);
  const [result, setResult] = useState(null);

  const computeEaster = useCallback((y, isOrthodox) => {
    const a = y % 19;
    const b = Math.floor(y / 100);
    const c = y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    if (isOrthodox) {
      const orthodoxDays = 13;
      const d2 = new Date(y, month - 1, day + orthodoxDays);
      return { month: d2.getMonth() + 1, day: d2.getDate(), year: y };
    }
    return { month, day, year: y };
  }, []);

  const handleFind = useCallback(() => {
    addEntry('Easter Date Finder');
    const western = computeEaster(year, false);
    const eastern = computeEaster(year, true);
    setResult({
      western: `${western.month}/${western.day}/${western.year}`,
      orthodox: `${eastern.month}/${eastern.day}/${eastern.year}`,
      westernObj: western,
      orthodoxObj: eastern,
    });
  }, [year, computeEaster, addEntry]);

  const monthName = (m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🥚</span>
        <h1 className="font-heading text-2xl font-bold text-text">Easter Date Finder</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-end gap-4">
            <label className="flex-1">
              <span className="text-xs text-text-tertiary block mb-1">Year</span>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
            <label className="flex items-center gap-2 pb-2">
              <input type="checkbox" checked={orthodox} onChange={e => setOrthodox(e.target.checked)}
                className="accent-primary w-4 h-4 cursor-pointer" />
              <span className="text-xs text-text-tertiary">Also show Orthodox</span>
            </label>
            <button onClick={handleFind}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Find
            </button>
          </div>
        </div>
      </GlassCard>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className={`grid ${orthodox ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div className="text-center p-4 bg-surface rounded-xl border border-border">
                  <div className="text-xs text-text-tertiary mb-2">Western Easter</div>
                  <div className="text-2xl font-bold font-heading text-text">
                    {monthName(result.westernObj.month)} {result.westernObj.day}
                  </div>
                  <div className="text-sm text-text-secondary">{result.westernObj.year}</div>
                </div>
                {orthodox && (
                  <div className="text-center p-4 bg-surface rounded-xl border border-border">
                    <div className="text-xs text-text-tertiary mb-2">Orthodox Easter</div>
                    <div className="text-2xl font-bold font-heading text-text">
                      {monthName(result.orthodoxObj.month)} {result.orthodoxObj.day}
                    </div>
                    <div className="text-sm text-text-secondary">{result.orthodoxObj.year}</div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
