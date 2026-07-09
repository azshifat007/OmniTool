'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function capitalize(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function generateParagraph(wordCount, startWithLorem) {
  const words = [];
  const startIndex = startWithLorem ? 0 : Math.floor(Math.random() * WORDS.length);
  for (let i = 0; i < wordCount; i++) {
    words.push(WORDS[(startIndex + i) % WORDS.length]);
  }
  if (words.length > 0) words[0] = capitalize(words[0]);
  return words.join(' ') + '.';
}

function generateLorem(paragraphs, startWithLorem, includeHtml) {
  const result = [];
  for (let i = 0; i < paragraphs; i++) {
    const wordCount = 20 + Math.floor(Math.random() * 30);
    const para = generateParagraph(wordCount, i === 0 && startWithLorem);
    if (includeHtml) {
      result.push('<p>' + para + '</p>');
    } else {
      result.push(para);
    }
  }
  return result.join(includeHtml ? '\n' : '\n\n');
}

export default function LoremPage() {
  const { addEntry } = useHistory();
  const [paragraphs, setParagraphs] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = useCallback(() => {
    const text = generateLorem(paragraphs, startWithLorem, includeHtml);
    setOutput(text);
    addEntry('Lorem Ipsum Generator');
  }, [paragraphs, startWithLorem, includeHtml, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">¶</span>
        <h1 className="font-heading text-2xl font-bold text-text">Lorem Ipsum Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Paragraphs: {paragraphs}</label>
            <input type="range" min={1} max={20} value={paragraphs}
              onChange={(e) => setParagraphs(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)}
                className="accent-primary rounded" />
              Start with "Lorem ipsum..."
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={includeHtml} onChange={(e) => setIncludeHtml(e.target.checked)}
                className="accent-primary rounded" />
              Include HTML tags (&lt;p&gt;)
            </label>
          </div>
          <button onClick={handleGenerate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Generate
          </button>
        </div>
      </GlassCard>

      {output && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated Text</span>
              <CopyButton text={output} />
            </div>
            <pre className="bg-surface rounded-lg px-4 py-3 text-sm text-text leading-relaxed border border-border/50 overflow-auto max-h-80 whitespace-pre-wrap font-sans">
              <code>{output}</code>
            </pre>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
