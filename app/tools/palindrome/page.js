'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function normalize(text, opts) {
  let result = text;
  if (!opts.caseSensitive) result = result.toLowerCase();
  if (opts.ignoreSpaces) result = result.replace(/\s+/g, '');
  if (opts.ignorePunctuation) result = result.replace(/[^a-zA-Z0-9\s]/g, '');
  return result;
}

function isPal(text) {
  return text === [...text].reverse().join('');
}

function canFormPal(text) {
  const counts = {};
  for (const ch of text) counts[ch] = (counts[ch] || 0) + 1;
  let odd = 0;
  for (const n of Object.values(counts)) if (n % 2) odd++;
  return odd <= 1;
}

const EXAMPLES = [
  { label: 'racecar', value: 'racecar' },
  { label: 'A man a plan a canal panama', value: 'A man a plan a canal panama' },
  { label: 'Never odd or even', value: 'Never odd or even' },
  { label: 'Was it a car or a cat I saw', value: 'Was it a car or a cat I saw' },
];

export default function PalindromePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);
  const [ignorePunctuation, setIgnorePunctuation] = useState(true);

  const opts = { caseSensitive, ignoreSpaces, ignorePunctuation };

  const normalized = useMemo(() => normalize(input, opts), [input, opts]);

  const result = useMemo(() => {
    if (!normalized) return null;
    return isPal(normalized);
  }, [normalized]);

  const reversed = useMemo(() => [...normalized].reverse().join(''), [normalized]);

  const comparisons = useMemo(() => {
    if (!normalized || normalized.length < 2) return [];
    const chars = [...normalized];
    const pairs = [];
    for (let i = 0; i < Math.floor(chars.length / 2); i++) {
      const j = chars.length - 1 - i;
      pairs.push({ left: chars[i], right: chars[j], match: chars[i] === chars[j], idx: i + 1 });
    }
    return pairs;
  }, [normalized]);

  const stats = useMemo(() => {
    if (!input) return null;
    const unique = new Set(normalized);
    return {
      original: input.length,
      normalized: normalized.length,
      unique: unique.size,
    };
  }, [input, normalized]);

  const perm = useMemo(() => {
    if (!normalized) return null;
    return canFormPal(normalized);
  }, [normalized]);

  const setExample = useCallback((text) => {
    setInput(text);
    addEntry('Palindrome Checker');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">&#8596;</span>
        <h1 className="font-heading text-2xl font-bold text-text">Palindrome Checker</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-3 block">Enter text to check</label>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) addEntry('Palindrome Checker'); }}
            rows={4}
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="Type or paste text here..." />
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLES.map((ex) => (
              <button key={ex.value} onClick={() => setExample(ex.value)}
                className="px-2 py-1 text-[10px] font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer truncate max-w-[180px]">
                &ldquo;{ex.label.length > 25 ? ex.label.substring(0, 25) + '...' : ex.label}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-4 my-4">
        {[
          { label: 'Case Sensitive', val: caseSensitive, set: setCaseSensitive },
          { label: 'Ignore Spaces', val: ignoreSpaces, set: setIgnoreSpaces },
          { label: 'Ignore Punctuation', val: ignorePunctuation, set: setIgnorePunctuation },
        ].map(({ label, val, set }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={val} onChange={() => set(!val)}
              className="w-4 h-4 rounded border-border bg-surface accent-primary" />
            <span className="text-xs text-text">{label}</span>
          </label>
        ))}
      </div>

      {input.trim() && (
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Result</span>
              </div>
              <div className={`text-lg font-bold ${result ? 'text-cat-success' : 'text-cat-text'}`}>
                {result ? 'Yes, it\'s a palindrome!' : 'No, it\'s not a palindrome.'}
              </div>
              {normalized !== input && (
                <div className="mt-2">
                  <span className="text-xs text-text-secondary">Normalized: </span>
                  <span className="text-sm font-mono text-text">{normalized}</span>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-2 block">Reversed Text</span>
                <div className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text break-all border border-border/50">
                  {reversed || <span className="text-text-tertiary">&mdash;</span>}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-2 block">Stats</span>
                {stats && (
                  <div className="space-y-1 text-xs text-text-secondary">
                    <div className="flex justify-between"><span>Original length:</span><span className="text-text font-mono">{stats.original}</span></div>
                    <div className="flex justify-between"><span>Normalized length:</span><span className="text-text font-mono">{stats.normalized}</span></div>
                    <div className="flex justify-between"><span>Unique characters:</span><span className="text-text font-mono">{stats.unique}</span></div>
                    <div className="flex justify-between">
                      <span>Permutation of palindrome:</span>
                      <span className={`font-mono ${perm ? 'text-cat-success' : 'text-cat-text'}`}>
                        {perm ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {comparisons.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-2 block">Character Comparison</span>
                <div className="space-y-1">
                  {comparisons.map((pair) => (
                    <div key={pair.idx} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-mono ${pair.match ? 'bg-cat-success/5' : 'bg-cat-text/5'}`}>
                      <span className={pair.match ? 'text-cat-success' : 'text-cat-text'}>{pair.match ? '\u2713' : '\u2717'}</span>
                      <span className="text-text">#{pair.idx}</span>
                      <span className="text-text">&ldquo;</span>
                      <span className={pair.match ? 'text-cat-success font-bold' : 'text-cat-text font-bold'}>{pair.left}</span>
                      <span className="text-text-secondary">vs</span>
                      <span className={pair.match ? 'text-cat-success font-bold' : 'text-cat-text font-bold'}>{pair.right}</span>
                      <span className="text-text">&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </motion.div>
  );
}
