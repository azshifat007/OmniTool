'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const tokenDefs = [
  { pattern: '^', label: '^', desc: 'Start of string anchor — matches the beginning of the input' },
  { pattern: '$', label: '$', desc: 'End of string anchor — matches the end of the input' },
  { pattern: '\\d', label: '\\d', desc: 'Digit character — matches any single digit (0-9)' },
  { pattern: '\\w', label: '\\w', desc: 'Word character — matches any letter, digit, or underscore' },
  { pattern: '\\s', label: '\\s', desc: 'Whitespace character — matches spaces, tabs, newlines' },
  { pattern: '\\.', label: '.', desc: 'Wildcard — matches any single character except newline' },
  { pattern: '\\*', label: '*', desc: 'Quantifier — matches zero or more of the preceding element' },
  { pattern: '\\+', label: '+', desc: 'Quantifier — matches one or more of the preceding element' },
  { pattern: '\\?', label: '?', desc: 'Quantifier — matches zero or one (optional) of the preceding element' },
  { pattern: '\\[', label: '[abc]', desc: 'Character class — matches any character inside the brackets' },
  { pattern: '\\[\\^', label: '[^abc]', desc: 'Negated character class — matches any character NOT inside' },
  { pattern: '\\|', label: '|', desc: 'Alternation — matches either the pattern before or after the pipe' },
  { pattern: '\\(\\?:', label: '(?:)', desc: 'Non-capturing group — groups subpatterns without capturing' },
  { pattern: '\\(', label: '()', desc: 'Capturing group — groups subpatterns and captures the match' },
  { pattern: '\\{', label: '{n,m}', desc: 'Quantifier — matches between n and m repetitions of the preceding' },
  { pattern: '\\b', label: '\\b', desc: 'Word boundary — matches between a word char and non-word char' },
];

function parseRegex(pattern) {
  if (!pattern.trim()) return [];
  const found = [];
  const remaining = pattern;
  for (const def of tokenDefs) {
    const re = new RegExp(def.pattern, 'g');
    let match;
    while ((match = re.exec(remaining)) !== null) {
      found.push({ ...def, index: match.index });
    }
  }
  found.sort((a, b) => a.index - b.index);
  return found;
}

function highlightMatches(text, regex) {
  if (!text || !regex) return null;
  const parts = [];
  let lastIndex = 0;
  let match;
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), highlighted: false });
    }
    parts.push({ text: match[0], highlighted: true });
    lastIndex = re.lastIndex;
    if (match.index === re.lastIndex) re.lastIndex++;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false });
  }
  return parts;
}

export default function RegexExplainPage() {
  const { addEntry } = useHistory();
  const [pattern, setPattern] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [highlighted, setHighlighted] = useState(null);

  const handleExplain = useCallback(() => {
    if (!pattern.trim()) return;
    const tokens = parseRegex(pattern);
    const flags = [];
    if (caseInsensitive) flags.push('i (case insensitive)');
    setExplanation({ tokens, flags });
    addEntry('Regex Explain');
  }, [pattern, caseInsensitive, addEntry]);

  let regex = null;
  try {
    if (pattern.trim()) {
      regex = new RegExp(pattern, caseInsensitive ? 'gi' : 'g');
    }
  } catch {}

  const handleTestInput = useCallback((val) => {
    setTestInput(val);
    if (regex && val.trim()) {
      setHighlighted(highlightMatches(val, regex));
    } else {
      setHighlighted(null);
    }
  }, [regex]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🔍</span>
        <h1 className="font-heading text-2xl font-bold text-text">Regex Explain</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Regular Expression</label>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \d{3}-\d{2}-\d{4}"
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="accent-primary rounded"
              />
              Case insensitive <code className="text-xs text-text-tertiary">/i</code>
            </label>
            <button
              onClick={handleExplain}
              disabled={!pattern.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Explain
            </button>
          </div>
        </div>
      </GlassCard>

      {explanation && (
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Components</span>
            </div>
            {explanation.tokens.length === 0 ? (
              <p className="text-sm text-text-secondary">No recognizable regex components found.</p>
            ) : (
              <div className="space-y-1.5">
                {explanation.tokens.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <code className="text-sm font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{t.label}</code>
                    <span className="text-sm text-text-secondary">{t.desc}</span>
                  </div>
                ))}
              </div>
            )}
            {explanation.flags.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-text-tertiary block mb-1">Flags</span>
                <div className="flex flex-wrap gap-2">
                  {explanation.flags.map((f, i) => (
                    <span key={i} className="text-xs bg-surface text-text-secondary border border-border/50 rounded-lg px-2 py-1">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {regex && (
        <GlassCard>
          <div className="p-4 space-y-3">
            <label className="text-xs text-text-tertiary block">Test against text</label>
            <textarea
              value={testInput}
              onChange={(e) => handleTestInput(e.target.value)}
              placeholder="Type text to test against the regex..."
              className="w-full h-32 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary"
            />
            {highlighted && highlighted.length > 0 && (
              <div className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border/50 whitespace-pre-wrap max-h-48 overflow-auto leading-relaxed">
                {highlighted.map((part, i) =>
                  part.highlighted ? (
                    <span key={i} className="bg-primary/30 text-text rounded px-0.5">{part.text}</span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
