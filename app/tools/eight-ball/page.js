'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const ANSWERS = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes – definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.',
  'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
  'Cannot predict now.', 'Concentrate and ask again.',
  "Don't count on it.", 'My reply is no.', 'My sources say no.',
  'Outlook not so good.', 'Very doubtful.',
];

export default function EightBallPage() {
  const { addEntry } = useHistory();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [shaking, setShaking] = useState(false);

  const shake = useCallback(() => {
    addEntry('Magic 8 Ball');
    if (!question.trim()) { setAnswer('Ask a question first!'); return; }
    setShaking(true);
    setAnswer('');
    setTimeout(() => {
      setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
      setShaking(false);
    }, 800);
  }, [question, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">🔮</span>
        <h1 className="font-heading text-2xl font-bold text-text">Magic 8 Ball</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4 text-center">
          <p className="text-sm text-text-secondary">Ask a yes/no question and let the 8 Ball decide.</p>
          <div>
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && shake()}
              placeholder="Type your question..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div className="flex justify-center">
            <motion.div
              animate={shaking ? { rotate: [0, -15, 15, -15, 15, 0], x: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.8 }}
              className="relative cursor-pointer select-none" onClick={shake}>
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 border-4 border-zinc-600 shadow-xl flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-600 flex items-center justify-center">
                  {shaking ? (
                    <span className="text-3xl text-zinc-400">?</span>
                  ) : answer ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-zinc-300 px-2 text-center leading-tight">{answer}</motion.span>
                  ) : (
                    <span className="text-3xl text-zinc-400">8</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          {!shaking && !answer && (
            <button onClick={shake} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Shake</button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
