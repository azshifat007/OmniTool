'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function DiceFace({ value }) {
  const dotPositions = {
    1: [[1, 1]],
    2: [[0, 2], [2, 0]],
    3: [[0, 2], [1, 1], [2, 0]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-2 w-20 h-20 bg-surface rounded-xl border border-border p-3">
      {[0, 1, 2].map(r => [0, 1, 2].map(c => {
        const hasDot = dotPositions[value]?.some(([dr, dc]) => dr === r && dc === c);
        return <div key={`${r}-${c}`} className={`rounded-full ${hasDot ? 'bg-primary' : ''}`} />;
      }))}
    </div>
  );
}

const modes = [
  { id: 'coin', icon: '⊙', label: 'Coin Flip' },
  { id: 'dice', icon: '⎔', label: 'Dice Roll' },
  { id: 'yesno', icon: '◔', label: 'Yes / No' },
  { id: 'custom', icon: '⋯', label: 'Custom Picker' },
];

const yesNoAnswers = ['Yes', 'No', 'Maybe', 'Definitely!', 'Not now', 'Ask again', 'Absolutely', 'No chance'];

export default function DecidePage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('coin');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState('');
  const [customOptions, setCustomOptions] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ heads: 0, tails: 0, diceCounts: [0, 0, 0, 0, 0, 0] });

  const addToHistory = useCallback((entry) => {
    setHistory(prev => [{ id: Date.now(), ...entry }, ...prev].slice(0, 10));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const flipCoin = useCallback(async () => {
    setSpinning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 600));
    const outcome = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setResult(outcome);
    setStats(prev => ({
      ...prev,
      heads: prev.heads + (outcome === 'Heads' ? 1 : 0),
      tails: prev.tails + (outcome === 'Tails' ? 1 : 0),
    }));
    addToHistory({ type: 'Coin Flip', value: outcome });
    addEntry('Decision Maker');
    setSpinning(false);
  }, [addEntry, addToHistory]);

  const rollDice = useCallback(async () => {
    setSpinning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 500));
    const value = Math.floor(Math.random() * 6) + 1;
    setResult(value);
    setStats(prev => {
      const counts = [...prev.diceCounts];
      counts[value - 1]++;
      return { ...prev, diceCounts: counts };
    });
    addToHistory({ type: 'Dice Roll', value: `${value}` });
    addEntry('Decision Maker');
    setSpinning(false);
  }, [addEntry, addToHistory]);

  const askYesNo = useCallback(async () => {
    if (!question.trim()) return;
    setSpinning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 700));
    const answer = yesNoAnswers[Math.floor(Math.random() * yesNoAnswers.length)];
    setResult(answer);
    addToHistory({ type: 'Yes / No', value: answer, detail: question.trim() });
    addEntry('Decision Maker');
    setSpinning(false);
  }, [question, addEntry, addToHistory]);

  const pickCustom = useCallback(async () => {
    const options = customOptions.split(',').map(s => s.trim()).filter(Boolean);
    if (options.length < 2) return;
    setSpinning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 500));
    const pick = options[Math.floor(Math.random() * options.length)];
    setResult(pick);
    addToHistory({ type: 'Custom Picker', value: pick, detail: options.join(', ') });
    addEntry('Decision Maker');
    setSpinning(false);
  }, [customOptions, addEntry, addToHistory]);

  const totalDecisions = history.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">⊙</span>
        <h1 className="font-heading text-2xl font-bold text-text">Decision Maker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {modes.map(m => (
                  <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      mode === m.id ? 'bg-primary text-white' : 'bg-surface text-text-tertiary hover:text-text border border-border'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {mode === 'coin' && (
                  <motion.div key="coin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                    <button onClick={flipCoin} disabled={spinning}
                      className="w-24 h-24 rounded-full bg-surface border-2 border-border flex items-center justify-center text-3xl font-bold text-primary hover:border-primary transition-all cursor-pointer disabled:opacity-50"
                    >
                      {spinning ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.3, ease: 'linear' }}>⊙</motion.span>
                      ) : result ? (
                        <motion.span initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>{result === 'Heads' ? 'H' : 'T'}</motion.span>
                      ) : '⊙'}
                    </button>
                    {!spinning && result && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-bold text-text">{result}</motion.span>
                    )}
                    {!result && !spinning && <span className="text-xs text-text-tertiary">Tap the coin to flip</span>}
                  </motion.div>
                )}

                {mode === 'dice' && (
                  <motion.div key="dice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                    <button onClick={rollDice} disabled={spinning}
                      className="cursor-pointer disabled:opacity-50"
                    >
                      {spinning ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.4, ease: 'linear' }}>
                          <DiceFace value={1} />
                        </motion.div>
                      ) : result ? (
                        <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }}>
                          <DiceFace value={result} />
                        </motion.div>
                      ) : (
                        <DiceFace value={1} />
                      )}
                    </button>
                    {!spinning && result && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-bold text-text">You rolled {result}!</motion.span>
                    )}
                    {!result && !spinning && <span className="text-xs text-text-tertiary">Tap the die to roll</span>}
                  </motion.div>
                )}

                {mode === 'yesno' && (
                  <motion.div key="yesno" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                    <input value={question} onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question..."
                      className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary" />
                    <button onClick={askYesNo} disabled={spinning || !question.trim()}
                      className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {spinning ? 'Thinking...' : 'Ask'}
                    </button>
                    {!spinning && result && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                        <span className={`text-2xl font-bold ${
                          result === 'Yes' || result === 'Definitely!' || result === 'Absolutely'
                            ? 'text-cat-success' : result === 'No' || result === 'Not now' || result === 'No chance'
                            ? 'text-cat-text' : 'text-cat-media'
                        }`}>{result}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {mode === 'custom' && (
                  <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                    <textarea value={customOptions} onChange={(e) => setCustomOptions(e.target.value)}
                      placeholder="Enter options separated by commas..."
                      className="w-full h-24 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary" />
                    <button onClick={pickCustom} disabled={spinning || customOptions.split(',').filter(s => s.trim()).length < 2}
                      className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {spinning ? 'Picking...' : 'Pick One'}
                    </button>
                    {!spinning && result && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                        <span className="text-2xl font-bold text-text">{result}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {mode === 'coin' && (stats.heads > 0 || stats.tails > 0) && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Coin Stats</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-center">
                    <div className="text-xs text-text-tertiary">Heads</div>
                    <div className="text-lg font-bold text-cat-success">{stats.heads}</div>
                  </div>
                  <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-center">
                    <div className="text-xs text-text-tertiary">Tails</div>
                    <div className="text-lg font-bold text-cat-text">{stats.tails}</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {mode === 'dice' && stats.diceCounts.some(c => c > 0) && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Dice Stats</span>
                <div className="grid grid-cols-6 gap-2">
                  {stats.diceCounts.map((count, i) => (
                    <div key={i} className="bg-surface rounded-lg px-2 py-2 border border-border/50 text-center">
                      <div className="text-xs font-bold text-text">{i + 1}</div>
                      <div className="text-xs text-text-tertiary">{count}</div>
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
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Recent Decisions ({totalDecisions})</span>
                {history.length > 0 && (
                  <button onClick={clearHistory}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer"
                  >Clear</button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-xs text-text-tertiary text-center py-6">No decisions yet</div>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="bg-surface rounded-lg px-3 py-2 border border-border/50 flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        entry.type === 'Coin Flip' ? 'bg-cat-math/20 text-cat-math' :
                        entry.type === 'Dice Roll' ? 'bg-cat-media/20 text-cat-media' :
                        entry.type === 'Yes / No' ? 'bg-cat-success/20 text-cat-success' :
                        'bg-cat-code/20 text-cat-code'
                      }`}>{entry.type}</span>
                      <span className="text-sm font-medium text-text flex-1">{entry.value}</span>
                      {entry.detail && <span className="text-[10px] text-text-tertiary truncate max-w-[120px]">{entry.detail}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
