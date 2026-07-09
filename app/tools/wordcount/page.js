'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function getStats(text) {
  if (!text) return null;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpace = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const sentences = text.split(/[.!?]+\s*/).filter((s) => s.trim()).length;
  const avgWordLength = words > 0 ? charactersNoSpace / words : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 130));

  const freq = {};
  const wordMatches = text.toLowerCase().match(/\b[a-z]+\b/g);
  if (wordMatches) {
    for (const w of wordMatches) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return { words, characters, charactersNoSpace, lines, paragraphs, sentences, avgWordLength, readingTime, speakingTime, topWords };
}

export default function WordcountPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const stats = getStats(input);

  const statCards = [
    { label: 'Words', value: stats?.words },
    { label: 'Characters', value: stats?.characters },
    { label: 'Characters (no spaces)', value: stats?.charactersNoSpace },
    { label: 'Lines', value: stats?.lines },
    { label: 'Paragraphs', value: stats?.paragraphs },
    { label: 'Sentences', value: stats?.sentences },
    { label: 'Avg. Word Length', value: stats ? stats.avgWordLength.toFixed(1) : null },
    { label: 'Reading Time', value: stats ? `${stats.readingTime} min` : null },
    { label: 'Speaking Time', value: stats ? `${stats.speakingTime} min` : null },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h1 className="font-heading text-2xl font-bold text-text">Word Counter</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-1.5 block">Type or paste text</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) addEntry('Word Counter'); }}
            placeholder="Paste or type text here to analyze..."
            className="w-full h-48 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary"
          />
        </div>
      </GlassCard>

      {input.trim() && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            {statCards.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-xl border border-border p-4"
              >
                <div className="text-2xl font-bold text-text mb-1 font-heading">
                  {item.value !== undefined && item.value !== null ? item.value : <span className="text-text-tertiary">—</span>}
                </div>
                <div className="text-xs text-text-secondary">{item.label}</div>
              </motion.div>
            ))}
          </div>

          {stats.topWords.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Most Used Words</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs text-text-tertiary pb-2 font-medium">#</th>
                        <th className="text-left text-xs text-text-tertiary pb-2 font-medium">Word</th>
                        <th className="text-right text-xs text-text-tertiary pb-2 font-medium">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topWords.map(([word, count], i) => (
                        <tr key={word} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 text-xs text-text-tertiary w-8">{i + 1}</td>
                          <td className="py-1.5 text-sm text-text">{word}</td>
                          <td className="py-1.5 text-sm text-text text-right font-mono">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </motion.div>
  );
}
