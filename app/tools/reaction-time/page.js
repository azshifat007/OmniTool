'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const states = { READY: 'ready', WAITING: 'waiting', GO: 'go', RESULT: 'result' };

export default function ReactionTimePage() {
  const { addEntry } = useHistory();
  const [gameState, setGameState] = useState(states.READY);
  const [reactionMs, setReactionMs] = useState(null);
  const [scores, setScores] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef(null);

  const startWait = useCallback(() => {
    setGameState(states.WAITING);
    const delay = 1000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setGameState(states.GO);
      setStartTime(performance.now());
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === states.READY) { startWait(); addEntry('Reaction Time Test'); }
    else if (gameState === states.WAITING) {
      clearTimeout(timerRef.current);
      setReactionMs(0);
      setGameState(states.RESULT);
    } else if (gameState === states.GO) {
      const ms = Math.round(performance.now() - startTime);
      setReactionMs(ms);
      setScores((p) => [ms, ...p].slice(0, 20));
      setGameState(states.RESULT);
    } else {
      setReactionMs(null);
      setGameState(states.READY);
    }
  }, [gameState, startTime, startWait, addEntry]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.min(...scores) : 0;

  const bgColor = gameState === states.GO ? 'bg-green-500/10 border-green-500/30' :
    gameState === states.WAITING ? 'bg-cat-text/10 border-cat-text/30' :
    'bg-surface border-border';

  const textColor = gameState === states.GO ? 'text-green-500' :
    gameState === states.WAITING ? 'text-cat-text' :
    'text-text-secondary';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⏱</span>
        <h1 className="font-heading text-2xl font-bold text-text">Reaction Time Test</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-6">
              <div onClick={handleClick}
                className={`w-full min-h-[300px] rounded-2xl border-2 flex items-center justify-center cursor-pointer select-none transition-all duration-200 ${bgColor}`}>
                <div className="text-center">
                  {gameState === states.READY && <div><div className="text-5xl mb-3 text-text-secondary">◎</div><div className="text-lg font-semibold text-text-secondary">Click to start</div></div>}
                  {gameState === states.WAITING && <div><div className="text-5xl mb-3 text-cat-text animate-pulse">◉</div><div className="text-lg font-semibold text-cat-text">Wait for green...</div></div>}
                  {gameState === states.GO && <div><div className="text-5xl mb-3 text-green-500">●</div><div className="text-lg font-semibold text-green-500">Click now!</div></div>}
                  {gameState === states.RESULT && (
                    <div>
                      <div className="text-6xl font-bold font-mono mb-2" style={{ color: reactionMs === 0 ? 'var(--cat-text)' : 'var(--text)' }}>
                        {reactionMs === 0 ? 'Too soon!' : `${reactionMs}ms`}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {reactionMs === 0 ? 'Wait for the green screen' : 'Click to try again'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          {scores.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Stats</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary">Best</div>
                    <div className="text-lg font-mono font-bold text-text">{best}ms</div>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary">Average</div>
                    <div className="text-lg font-mono font-bold text-text">{avg}ms</div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-text-tertiary mb-1 block">History</span>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {scores.map((s, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-mono bg-surface rounded px-2 py-1 border border-border">
                        <span className="text-text-secondary">#{i + 1}</span>
                        <span className={s < 200 ? 'text-green-500' : s < 300 ? 'text-yellow-500' : 'text-cat-text'}>{s}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-2 block">Rating</span>
              <div className="text-[11px] text-text-secondary space-y-1">
                <div>&lt; 150ms: Excellent</div>
                <div>150-200ms: Good</div>
                <div>200-250ms: Average</div>
                <div>250-300ms: Below average</div>
                <div>&gt; 300ms: Slow</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
