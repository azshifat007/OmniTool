'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const WORDS = [
  'REACT', 'JAVASCRIPT', 'PYTHON', 'TYPESCRIPT', 'CODING', 'DEVELOPER',
  'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPONENT', 'DATABASE', 'NETWORK',
  'BROWSER', 'SERVER', 'CLIENT', 'FRAMEWORK', 'LIBRARY', 'MODULE',
  'OBJECT', 'ARRAY', 'STRING', 'BOOLEAN', 'PROMISE', 'ASYNC',
  'GITHUB', 'DOCKER', 'KUBERNETES', 'TERMINAL', 'COMMAND',
];

export default function HangmanPage() {
  const { addEntry } = useHistory();
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);
  const maxWrong = 6;

  const newGame = useCallback(() => {
    addEntry('Hangman');
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
    setWrong(0);
  }, [addEntry]);

  useEffect(() => { if (!word) newGame(); }, [word, newGame]);

  const guess = useCallback((letter) => {
    if (!word || guessed.has(letter) || wrong >= maxWrong) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);
    if (!word.includes(letter)) setWrong(w => w + 1);
  }, [word, guessed, wrong]);

  const display = word.split('').map(l => guessed.has(l) ? l : '_').join(' ');
  const won = word && !display.includes('_');
  const lost = wrong >= maxWrong;

  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🎮</span>
        <h1 className="font-heading text-2xl font-bold text-text">Hangman</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-text-tertiary">Wrong: {wrong}/{maxWrong}</span>
            <button onClick={newGame} className="px-3 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">New Game</button>
          </div>
          <div className="text-3xl font-mono font-bold text-text tracking-widest py-3">{display || '_ _ _ _ _'}</div>
          {won && <div className="text-cat-success text-lg font-bold">You Won! 🎉</div>}
          {lost && <div className="text-cat-text text-lg font-bold">Game Over! Word was: <span className="font-mono">{word}</span></div>}
          {!won && !lost && (
            <div className="grid grid-cols-7 gap-1.5 max-w-xs mx-auto">
              {keys.map(k => {
                const used = guessed.has(k);
                const inWord = word.includes(k);
                return (
                  <button key={k} onClick={() => guess(k)} disabled={used || won || lost}
                    className={`w-8 h-8 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      used ? (inWord ? 'bg-cat-success/20 text-cat-success' : 'bg-cat-text/10 text-cat-text') : 'bg-surface border border-border text-text hover:border-primary'
                    } disabled:cursor-not-allowed`}>{k}</button>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
