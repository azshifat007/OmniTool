'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function getSeason(date) {
  const m = date.getMonth();
  const d = date.getDate();
  const y = date.getFullYear();
  const isSouth = false;

  const astro = (() => {
    if (m === 11 && d >= 21 || m <= 1 || (m === 2 && d < 20)) return 'Winter';
    if (m === 2 && d >= 20 || m <= 4 || (m === 5 && d < 21)) return 'Spring';
    if (m === 5 && d >= 21 || m <= 7 || (m === 8 && d < 22)) return 'Summer';
    return 'Autumn';
  })();

  const meteo = (() => {
    if (m >= 2 && m <= 4) return 'Spring';
    if (m >= 5 && m <= 7) return 'Summer';
    if (m >= 8 && m <= 10) return 'Autumn';
    return 'Winter';
  })();

  return { astro, meteo, month: m, day: d, year: y };
}

const SEASON_EMOJI = { Spring: '🌸', Summer: '☀️', Autumn: '🍂', Winter: '❄️' };

export default function SeasonPage() {
  const { addEntry } = useHistory();
  const [today] = useState(() => new Date());
  const [date, setDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => { addEntry('Season Finder'); }, [addEntry]);

  const dt = date ? new Date(date + 'T12:00:00') : today;
  const season = getSeason(dt);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-date">🌸</span>
        <h1 className="font-heading text-2xl font-bold text-text">Season Finder</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Find the astronomical and meteorological season for any date.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <motion.div key={date} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 pt-2">
            <div className="text-6xl">{SEASON_EMOJI[season.astro] || '🌍'}</div>
            <div>
              <div className="text-lg font-medium text-text">{season.astro}</div>
              <div className="text-xs text-text-tertiary">Astronomical Season</div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                <div className="text-xl mb-1">{SEASON_EMOJI[season.meteo]}</div>
                <div className="text-sm font-medium text-text">{season.meteo}</div>
                <div className="text-[10px] text-text-tertiary">Meteorological</div>
              </div>
              <div className="bg-surface rounded-xl px-4 py-3 border border-border/50">
                <div className="text-xl mb-1">📅</div>
                <div className="text-sm font-medium text-text">{season.month + 1}/{season.day}</div>
                <div className="text-[10px] text-text-tertiary">Date</div>
              </div>
            </div>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
