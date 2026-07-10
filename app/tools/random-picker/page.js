'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function RandomPickerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [items, setItems] = useState([]);
  const [picked, setPicked] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState([]);
  const intervalRef = useRef(null);

  const parseItems = useCallback(() => {
    const list = input.split('\n').map(s => s.trim()).filter(Boolean);
    setItems(list);
    setPicked(null);
    setResults([]);
  }, [input]);

  const pick = useCallback(() => {
    if (items.length === 0) return;
    addEntry('Random Picker');
    setSpinning(true);
    let ticks = 0;
    const maxTicks = 20 + Math.floor(Math.random() * 10);
    intervalRef.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * items.length);
      setPicked(items[randomIdx]);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        setSpinning(false);
        const chosen = [];
        const available = [...items];
        for (let i = 0; i < Math.min(count, available.length); i++) {
          const idx = Math.floor(Math.random() * available.length);
          chosen.push(available[idx]);
          available.splice(idx, 1);
        }
        setPicked(chosen[0]);
        setResults(chosen);
      }
    }, 60);
  }, [items, count, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">?</span>
        <h1 className="font-heading text-2xl font-bold text-text">Random Picker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Enter items (one per line)</label>
              <textarea value={input} onChange={e => { setInput(e.target.value); }}
                placeholder="apple&#10;banana&#10;cherry&#10;durian"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors min-h-[160px] resize-y" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={parseItems}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">
                Parse ({items.length} items)
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs text-text-tertiary">Pick</label>
                <select value={count} onChange={e => setCount(parseInt(e.target.value))}
                  className="bg-surface rounded-lg px-2 py-1 text-xs text-text border border-border cursor-pointer">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-tertiary">item{count > 1 ? 's' : ''}</span>
              </div>
            </div>
            <button onClick={pick} disabled={items.length === 0 || spinning}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              {spinning ? 'Picking...' : 'Pick Random'}
            </button>
          </div>
        </GlassCard>

        <div className="space-y-5">
          {items.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Items ({items.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                  {items.map((item, i) => (
                    <span key={i}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                        results.includes(item)
                          ? 'bg-primary/20 border-primary/40 text-primary font-semibold'
                          : 'bg-surface border-border/50 text-text-secondary'
                      }`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {picked && !spinning && (
            <GlassCard>
              <div className="p-4 text-center">
                <span className="text-xs text-text-tertiary mb-2 block">
                  Picked {results.length > 1 ? `${results.length} items` : 'item'}
                </span>
                <div className="flex flex-wrap justify-center gap-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
                        className="text-2xl font-bold font-heading text-primary"
                      >
                        {r}
                      </motion.div>
                      <CopyButton text={r} />
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {spinning && picked && (
            <GlassCard>
              <div className="p-4 text-center">
                <span className="text-xs text-text-tertiary mb-2 block">Picking...</span>
                <div className="text-2xl font-bold font-heading text-primary">{picked}</div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
