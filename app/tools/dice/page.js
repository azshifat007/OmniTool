'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const sideOptions = [4, 6, 8, 10, 12, 20, 100];

const pipPositions = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DieFace({ value, sides }) {
  if (sides === 6) {
    const pips = pipPositions[value] || [];
    return (
      <div className="w-16 h-16 bg-surface rounded-xl border-2 border-border flex items-center justify-center shadow-sm">
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-12 h-12">
          {[0, 1, 2].map(r => [0, 1, 2].map(c => {
            const hasPip = pips.some(([pr, pc]) => pr === r && pc === c);
            return (
              <div key={`${r}-${c}`} className="flex items-center justify-center">
                {hasPip && <div className="w-2.5 h-2.5 rounded-full bg-text" />}
              </div>
            );
          }))}
        </div>
      </div>
    );
  }

  const colors = {
    4: 'border-cat-code text-cat-code',
    8: 'border-cat-media text-cat-media',
    10: 'border-cat-success text-cat-success',
    12: 'border-cat-security text-cat-security',
    20: 'border-cat-design text-cat-design',
    100: 'border-cat-text text-cat-text',
  };

  return (
    <div className={`w-16 h-16 bg-surface rounded-xl border-2 flex items-center justify-center shadow-sm ${colors[sides] || 'border-border text-text'}`}>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export default function DicePage() {
  const { addEntry } = useHistory();
  const [numDice, setNumDice] = useState(2);
  const [sides, setSides] = useState(6);
  const [results, setResults] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [history, setHistory] = useState([]);
  const shakeTimeout = useRef(null);

  const handleRoll = useCallback(() => {
    if (shaking) return;
    setShaking(true);
    setResults(null);
    addEntry('Dice Roller');

    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    shakeTimeout.current = setTimeout(() => {
      const dice = Array.from({ length: numDice }, () => rollDie(sides));
      setResults(dice);
      setShaking(false);
      setHistory(prev => [{ dice, sides, timestamp: Date.now() }, ...prev].slice(0, 20));
    }, 400);
  }, [numDice, sides, shaking, addEntry]);

  const stats = results ? {
    total: results.reduce((a, b) => a + b, 0),
    avg: (results.reduce((a, b) => a + b, 0) / results.length).toFixed(1),
    highest: Math.max(...results),
    lowest: Math.min(...results),
  } : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">[D]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Dice Roller</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Number of Dice: {numDice}</label>
                <input type="range" min={1} max={10} value={numDice} onChange={(e) => setNumDice(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
                <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                  <span>1</span><span>10</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Sides per Die</label>
                <div className="flex flex-wrap gap-1.5">
                  {sideOptions.map(s => (
                    <button key={s} onClick={() => setSides(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        sides === s ? 'bg-primary text-white' : 'bg-surface text-text-tertiary border border-border hover:border-primary/40 hover:text-text'
                      }`}>
                      d{s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleRoll} disabled={shaking}
                className="w-full px-4 py-3 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {shaking ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
          </GlassCard>

          {history.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Roll History</span>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.map((entry, i) => (
                    <div key={entry.timestamp} className="bg-surface rounded-lg px-3 py-2 border border-border/50 flex items-center justify-between">
                      <div className="flex gap-1">
                        {entry.dice.slice(0, 5).map((v, j) => (
                          <span key={j} className="text-xs font-mono text-text bg-bg rounded px-1.5 py-0.5">{v}</span>
                        ))}
                        {entry.dice.length > 5 && (
                          <span className="text-xs text-text-tertiary">+{entry.dice.length - 5}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-tertiary font-mono">
                        d{entry.sides} &times;{entry.dice.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Result</span>
              <AnimatePresence mode="wait">
                {shaking ? (
                  <motion.div key="shaking" className="flex flex-wrap gap-3 justify-center py-8"
                    animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}>
                    {Array.from({ length: numDice }).map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-surface rounded-xl border-2 border-border flex items-center justify-center shadow-sm opacity-50">
                        <span className="text-lg font-bold font-mono text-text-tertiary">?</span>
                      </div>
                    ))}
                  </motion.div>
                ) : results ? (
                  <motion.div key="results" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {results.map((val, i) => (
                        <motion.div key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.05 }}>
                          <DieFace value={val} sides={sides} />
                        </motion.div>
                      ))}
                    </div>

                    {stats && (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Total', value: stats.total },
                          { label: 'Average', value: stats.avg },
                          { label: 'Highest', value: stats.highest },
                          { label: 'Lowest', value: stats.lowest },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                            <div className="text-xs text-text-tertiary">{label}</div>
                            <div className="text-sm font-mono text-text font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center text-sm text-text-tertiary py-8">Press Roll to see results</div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {history.length > 1 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Session Stats</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Rolls', value: history.length },
                    { label: 'Avg per Roll', value: (history.reduce((s, e) => s + e.dice.reduce((a, b) => a + b, 0), 0) / history.length).toFixed(1) },
                    { label: 'Highest Ever', value: Math.max(...history.map(e => Math.max(...e.dice))) },
                    { label: 'Lowest Ever', value: Math.min(...history.map(e => Math.min(...e.dice))) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-xs text-text-tertiary">{label}</div>
                      <div className="text-sm font-mono text-text font-bold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
