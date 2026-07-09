'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const passages = [
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.',
  'Programming is the art of telling a computer what to do. Learning to code is like learning a new language. Practice makes perfect every single day.',
  'In a world of technology, creativity is the most valuable skill. Build things that matter. Solve problems that make a difference in peoples lives.',
  'The best way to predict the future is to create it. Every great developer started with a single line of code. Keep learning and never give up.',
  'Simplicity is the ultimate sophistication. Write code that is easy to read and understand. Clean code is more important than clever code.',
];

export default function TypingSpeedPage() {
  const { addEntry } = useHistory();
  const [passage, setPassage] = useState(passages[0]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);
  const [active, setActive] = useState(false);
  const inputRef = useRef(null);

  const start = useCallback((text) => {
    setPassage(text);
    setInput('');
    setStartTime(null);
    setResults(null);
    setActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
    addEntry('Typing Speed Test');
  }, [addEntry]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!startTime && val.length === 1) setStartTime(performance.now());
    setInput(val);

    if (val.length === passage.length) {
      const elapsed = (performance.now() - startTime) / 1000 / 60;
      const words = passage.split(' ').length;
      const wpm = Math.round(words / elapsed);
      const chars = val.split('');
      const correct = passage.split('').filter((c, i) => c === (chars[i] || '')).length;
      const accuracy = Math.round((correct / passage.length) * 100);
      setResults({ wpm, accuracy, time: Math.round(elapsed * 60), correct, total: passage.length });
      setActive(false);
    }
  };

  const currentChar = input.length < passage.length ? passage[input.length] : '';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">⌨</span>
        <h1 className="font-heading text-2xl font-bold text-text">Typing Speed Test</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {passages.map((p, i) => (
              <button key={i} onClick={() => start(p)} disabled={active}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  passage === p && !results ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                } disabled:opacity-50`}>Passage {i + 1}</button>
            ))}
            <button onClick={() => start(passages[Math.floor(Math.random() * passages.length)])} disabled={active}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text disabled:opacity-50 cursor-pointer">Random</button>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-border leading-relaxed text-sm font-mono">
            {passage.split('').map((c, i) => {
              const typed = input[i];
              let color = 'text-text-secondary';
              if (typed != null) color = typed === c ? 'text-green-500' : 'text-cat-text';
              if (i === input.length) color = 'text-text bg-primary/10 rounded';
              return <span key={i} className={color}>{c}</span>;
            })}
          </div>

          <textarea ref={inputRef} value={input} onChange={handleChange} disabled={!active || results}
            placeholder={active ? 'Start typing...' : 'Click a passage to begin'}
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
            rows={3} />

          {input.length > 0 && (
            <div className="text-[10px] text-text-secondary font-mono">
              {input.length} / {passage.length} characters
            </div>
          )}

          {results && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-surface rounded-lg p-3 border border-border text-center">
                <div className="text-[10px] text-text-tertiary">Speed</div>
                <div className="text-2xl font-mono font-bold text-text">{results.wpm}</div>
                <div className="text-[10px] text-text-secondary">WPM</div>
              </div>
              <div className="bg-surface rounded-lg p-3 border border-border text-center">
                <div className="text-[10px] text-text-tertiary">Accuracy</div>
                <div className="text-2xl font-mono font-bold text-text">{results.accuracy}%</div>
                <div className="text-[10px] text-text-secondary">{results.correct}/{results.total}</div>
              </div>
              <div className="bg-surface rounded-lg p-3 border border-border text-center">
                <div className="text-[10px] text-text-tertiary">Time</div>
                <div className="text-2xl font-mono font-bold text-text">{results.time}s</div>
                <div className="text-[10px] text-text-secondary">elapsed</div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
