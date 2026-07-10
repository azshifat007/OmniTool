'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const quotes = [
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
  { text: 'First solve the problem, then write the code.', author: 'John Johnson' },
  { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
  { text: 'The function of good software is to make the complex appear to be simple.', author: 'Grady Booch' },
  { text: 'Debugging is twice as hard as writing the code in the first place.', author: 'Brian Kernighan' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Making your software do what it is supposed to do is not the challenge; making it easy to use is.', author: 'Jakob Nielsen' },
  { text: 'A language that doesn\'t affect the way you think about programming is not worth knowing.', author: 'Alan Perlis' },
  { text: 'The most dangerous phrase in the language is: "We\'ve always done it this way."', author: 'Grace Hopper' },
  { text: 'Measurement is the first step that leads to control and eventually improvement.', author: 'H. James Harrington' },
  { text: 'If you can\'t explain it simply, you don\'t understand it well enough.', author: 'Albert Einstein' },
];

export default function QuotesPage() {
  const { addEntry } = useHistory();
  const [current, setCurrent] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const next = useCallback(() => {
    let q;
    do { q = quotes[Math.floor(Math.random() * quotes.length)]; } while (q.text === current.text && quotes.length > 1);
    setCurrent(q);
    addEntry('Quote Generator');
  }, [current, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">❝</span>
        <h1 className="font-heading text-2xl font-bold text-text">Quote Generator</h1>
      </div>
      <GlassCard>
        <div className="p-6 text-center space-y-5 max-w-lg mx-auto">
          <motion.div key={current.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-4xl text-primary/30 font-serif leading-none">"</div>
            <p className="text-lg text-text leading-relaxed font-medium italic">"{current.text}"</p>
            <p className="text-sm text-text-secondary">— {current.author}</p>
          </motion.div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={next} className="px-5 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Next Quote</button>
            <CopyButton text={`"${current.text}" — ${current.author}`} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
