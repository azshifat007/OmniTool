'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

function getStats(text) {
  if (!text) return null;
  const characters = text.length;
  const charactersNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+\s*/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = text.split('\n').filter((l) => l.trim()).length;
  const spaces = (text.match(/\s/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 150));
  return { characters, charactersNoSpace, words, sentences, paragraphs, lines, spaces, letters, digits, readingTime, speakingTime };
}

export default function StatsPage() {
  const [text, setText] = useState('');
  const stats = getStats(text);

  const items = [
    { label: 'Characters', value: stats?.characters },
    { label: 'Characters (no space)', value: stats?.charactersNoSpace },
    { label: 'Words', value: stats?.words },
    { label: 'Sentences', value: stats?.sentences },
    { label: 'Paragraphs', value: stats?.paragraphs },
    { label: 'Lines', value: stats?.lines },
    { label: 'Spaces', value: stats?.spaces },
    { label: 'Letters', value: stats?.letters },
    { label: 'Digits', value: stats?.digits },
    { label: 'Reading Time', value: stats ? `${stats.readingTime} min` : null },
    { label: 'Speaking Time', value: stats ? `${stats.speakingTime} min` : null },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Text Statistics</h1>
        <p className="text-text-secondary">Analyze word, character, sentence count and more</p>
      </motion.div>

      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text to analyze..."
          className="w-full h-44 bg-transparent text-text resize-none outline-none text-sm leading-relaxed placeholder:text-text-tertiary"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-border p-4"
          >
            <div className="text-2xl font-bold text-text mb-1 font-heading">
              {item.value !== undefined ? item.value : <span className="text-text-tertiary">—</span>}
            </div>
            <div className="text-xs text-text-secondary">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
