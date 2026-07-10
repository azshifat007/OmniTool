'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const WORDS = [
  'PYTHON', 'JAVASCRIPT', 'DEVELOPER', 'ALGORITHM', 'FUNCTION',
  'VARIABLE', 'DATABASE', 'NETWORK', 'BROWSER', 'SERVER',
  'COMPONENT', 'MODULE', 'PACKAGE', 'FRAMEWORK', 'LIBRARY',
  'CONTAINER', 'DEPLOYMENT', 'INTERFACE', 'PROTOCOL', 'CACHE',
];

function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export default function WordScramblePage() {
  const { addEntry } = useHistory();
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const newWord = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setScrambled(scrambleWord(w));
    setGuess('');
    setResult('');
  }, []);

  useEffect(() => { newWord(); }, [newWord]);

  const check = useCallback(() => {
    addEntry('Word Scramble');
    setTotal(t => t + 1);
    if (guess.trim().toUpperCase() === word) {
      setResult('correct');
      setScore(s => s + 1);
    } else {
      setResult('wrong');
    }
  }, [guess, word, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🔤</span>
        <h1 className="font-heading text-2xl font-bold text-text">Word Scramble</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-text-tertiary">Score: <span className="text-text font-semibold">{score}/{total}</span></span>
            <button onClick={newWord} className="px-3 py-1 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Skip</button>
          </div>
          <div className="text-4xl font-mono font-bold text-text tracking-widest py-4">{scrambled}</div>
          <p className="text-sm text-text-secondary">Unscramble the word</p>
          <div className="flex gap-2">
            <input value={guess} onChange={(e) => setGuess(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && guess && check()}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center uppercase" placeholder="Your answer" />
            <button onClick={check} disabled={!guess.trim()} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">Guess</button>
          </div>
          {result === 'correct' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cat-success text-sm font-medium">Correct! 🎉</motion.div>
          )}
          {result === 'wrong' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-cat-text text-sm font-medium">Wrong! The word was <span className="font-mono">{word}</span></motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
