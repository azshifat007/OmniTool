'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function RegexPage() {
  const { addEntry } = useHistory();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('gm');
  const [testText, setTestText] = useState('');
  const [error, setError] = useState('');
  const lastMatchCount = useRef(0);

  const regexResult = useMemo(() => {
    if (!pattern) return { matches: [], highlight: [], groups: [] };
    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      const groups = [];
      let m;
      while ((m = regex.exec(testText)) !== null) {
        matches.push({ index: m.index, text: m[0], length: m[0].length });
        if (m.length > 1) {
          for (let i = 1; i < m.length; i++) {
            groups.push({ groupNum: i, value: m[i], index: m.index });
          }
        }
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }

      const highlight = [];
      let lastEnd = 0;
      const sorted = [...matches].sort((a, b) => a.index - b.index);
      for (const match of sorted) {
        if (match.index > lastEnd) {
          highlight.push({ type: 'text', text: testText.slice(lastEnd, match.index) });
        }
        highlight.push({ type: 'match', text: match.text });
        lastEnd = match.index + match.length;
      }
      if (lastEnd < testText.length) {
        highlight.push({ type: 'text', text: testText.slice(lastEnd) });
      }
      if (highlight.length === 0 && testText) {
        highlight.push({ type: 'text', text: testText });
      }

      return { matches, highlight, groups, error: null };
    } catch (e) {
      return { matches: [], highlight: [{ type: 'text', text: testText }], groups: [], error: e.message };
    }
  }, [pattern, flags, testText]);

  useEffect(() => {
    if (regexResult.error) {
      setError(regexResult.error);
    } else {
      setError('');
      if (regexResult.matches.length > 0 && regexResult.matches.length !== lastMatchCount.current) {
        lastMatchCount.current = regexResult.matches.length;
        addEntry('Regex Tester');
      }
    }
  }, [regexResult, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Regex Tester & Visualizer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Pattern</label>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="/your-regex-pattern/"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Flags</label>
                <input
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  placeholder="gm"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors max-w-[120px]"
                />
              </div>
              {error && (
                <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
                  {error}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-2 block">Test Content</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={10}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Live Highlighting ({regexResult.matches.length} match{regexResult.matches.length !== 1 ? 'es' : ''})</span>
                <CopyButton text={testText} />
              </div>
              <div className="bg-surface rounded-lg p-3 min-h-[200px] text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
                {regexResult.highlight.length > 0 ? (
                  regexResult.highlight.map((seg, i) =>
                    seg.type === 'match' ? (
                      <mark key={i} className="bg-primary/40 text-text rounded-sm px-0.5">{seg.text}</mark>
                    ) : (
                      <span key={i} className="text-text-tertiary">{seg.text}</span>
                    )
                  )
                ) : (
                  <span className="text-text-secondary">Enter a pattern and test content to see matches</span>
                )}
              </div>
            </div>
          </GlassCard>

          {regexResult.groups.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Capture Groups</span>
                <div className="space-y-1.5">
                  {regexResult.groups.map((g, i) => (
                    <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono flex items-center gap-3">
                      <span className="text-primary text-xs">${g.groupNum}</span>
                      <span className="text-text">{g.value}</span>
                      <span className="text-text-secondary text-xs ml-auto">pos {g.index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {regexResult.matches.length > 0 && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">All Matches</span>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {regexResult.matches.map((m, i) => (
                    <div key={i} className="bg-surface rounded-lg px-3 py-1.5 text-sm font-mono flex items-center gap-3">
                      <span className="text-text-tertiary text-xs">#{i + 1}</span>
                      <span className="text-text">&ldquo;{m.text}&rdquo;</span>
                      <span className="text-text-secondary text-xs ml-auto">@{m.index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
