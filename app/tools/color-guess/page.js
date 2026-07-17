'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b, hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') };
}

const DIFFICULTY = { Easy: 4, Medium: 6, Hard: 8 };

export default function ColorGuessPage() {
  const { addEntry } = useHistory();
  const [target, setTarget] = useState(() => randomColor());
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [options, setOptions] = useState([]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [best, setBest] = useState(0);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('omnitool-colorguess-best') || '0');
    if (!isNaN(saved)) setBest(saved);
  }, []);

  const newRound = useCallback(() => {
    const t = randomColor();
    const count = DIFFICULTY[difficulty];
    const opts = [t.hex];
    while (opts.length < count) {
      const h = randomColor().hex;
      if (!opts.includes(h)) opts.push(h);
    }
    opts.sort(() => Math.random() - 0.5);
    setTarget(t);
    setOptions(opts);
    setFeedback('');
  }, [difficulty]);

  useEffect(() => { newRound(); }, [newRound]);

  const guess = useCallback((hex) => {
    addEntry('Color Guessing Game');
    if (feedback) return;
    setTotal(t => t + 1);
    if (hex === target.hex) {
      setScore(s => {
        const ns = s + 1;
        if (ns > best) { setBest(ns); localStorage.setItem('omnitool-colorguess-best', String(ns)); }
        return ns;
      });
      setFeedback('Correct! 🎉');
    } else {
      setFeedback(`Wrong! It was ${target.hex}`);
    }
  }, [feedback, target, addEntry, best]);

  const accuracy = useMemo(() => total ? Math.round(score / total * 100) : 0, [score, total]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">◐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Color Guessing Game</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-text-tertiary">Score: <span className="text-text font-semibold">{score}/{total}</span></span>
            <span className="text-sm text-text-tertiary">Best: <span className="text-text font-semibold">{best}</span></span>
            <span className="text-sm text-text-tertiary">Acc: <span className="text-text font-semibold">{accuracy}%</span></span>
          </div>
          <div className="flex justify-center gap-2">
            {Object.keys(DIFFICULTY).map(d => (
              <button key={d} onClick={() => { setDifficulty(d); setScore(0); setTotal(0); setFeedback(''); }} disabled={!!feedback}
                className={`px-3 py-1 text-xs rounded-lg ${difficulty === d ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'} transition-all cursor-pointer disabled:opacity-50`}>{d}</button>
            ))}
          </div>
          <div className="w-40 h-40 mx-auto rounded-2xl border-2 border-border shadow-lg" style={{ backgroundColor: target.hex }} />
          <p className="text-sm text-text-secondary">Which hex code matches this color?</p>
          <div className="grid grid-cols-2 gap-2">
            {options.map((hex) => (
              <button key={hex} onClick={() => guess(hex)} disabled={!!feedback}
                className="px-3 py-2.5 text-sm font-mono font-medium rounded-lg bg-surface border border-border text-text hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer">{hex}</button>
            ))}
          </div>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`text-sm font-medium ${feedback.startsWith('Correct') ? 'text-cat-success' : 'text-cat-text'}`}>{feedback}</div>
              <button onClick={newRound} className="mt-3 px-6 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Next Round</button>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
