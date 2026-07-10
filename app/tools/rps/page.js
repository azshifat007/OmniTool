'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const CHOICES = [
  { label: 'Rock', icon: '🪨', beats: 'Scissors' },
  { label: 'Paper', icon: '📄', beats: 'Rock' },
  { label: 'Scissors', icon: '✂️', beats: 'Paper' },
];

function getResult(player, computer) {
  if (player.label === computer.label) return 'draw';
  if (player.beats === computer.label) return 'win';
  return 'lose';
}

export default function RpsPage() {
  const { addEntry } = useHistory();
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });

  const play = useCallback((choice) => {
    addEntry('Rock Paper Scissors');
    const comp = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    setPlayerChoice(choice);
    setComputerChoice(comp);
    const r = getResult(choice, comp);
    setResult(r);
    setScore(s => ({ ...s, [r === 'win' ? 'wins' : r === 'lose' ? 'losses' : 'draws']: s[r === 'win' ? 'wins' : r === 'lose' ? 'losses' : 'draws'] + 1 }));
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🪨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Rock Paper Scissors</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Choose your move against the computer.</p>
          <div className="flex justify-center gap-3">
            {CHOICES.map(c => (
              <button key={c.label} onClick={() => play(c)}
                className="flex flex-col items-center gap-1 px-6 py-4 rounded-xl bg-surface border border-border hover:border-primary transition-all cursor-pointer">
                <span className="text-3xl">{c.icon}</span>
                <span className="text-xs font-medium text-text">{c.label}</span>
              </button>
            ))}
          </div>
          {playerChoice && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-1">{playerChoice.icon}</div>
                  <div className="text-xs text-text-tertiary">You</div>
                </div>
                <span className="text-2xl text-text-tertiary">VS</span>
                <div className="text-center">
                  <div className="text-4xl mb-1">{computerChoice.icon}</div>
                  <div className="text-xs text-text-tertiary">Computer</div>
                </div>
              </div>
              <div className={`text-lg font-bold font-heading ${result === 'win' ? 'text-cat-success' : result === 'lose' ? 'text-cat-text' : 'text-text-secondary'}`}>
                {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-cat-success">W: {score.wins}</span>
                <span className="text-cat-text">L: {score.losses}</span>
                <span className="text-text-tertiary">D: {score.draws}</span>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
