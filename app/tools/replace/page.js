'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function doReplace(text, find, replace, caseInsensitive, regexMode) {
  if (!text || !find) return { result: text, count: 0, diffs: [] };
  let flags = 'g';
  if (caseInsensitive) flags += 'i';
  let pattern;
  try {
    pattern = regexMode ? new RegExp(find, flags) : new RegExp(escapeRegex(find), flags);
  } catch {
    return { result: text, count: 0, diffs: [], error: 'Invalid regular expression' };
  }
  let count = 0;
  const result = text.replace(pattern, (...m) => {
    count++;
    return typeof replace === 'string' ? replace : m[0];
  });
  return { result, count };
}

function highlightDiff(original, findText, replaceText, caseInsensitive, regexMode) {
  if (!original || !findText) return null;
  const flags = caseInsensitive ? 'gi' : 'g';
  let pattern;
  try {
    pattern = regexMode ? new RegExp(findText, flags) : new RegExp(escapeRegex(findText), flags);
  } catch {
    return null;
  }
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(original)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: original.slice(lastIndex, match.index), type: 'same' });
    }
    parts.push({ text: match[0], type: 'removed' });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < original.length) {
    parts.push({ text: original.slice(lastIndex), type: 'same' });
  }
  return parts;
}

export default function ReplacePage() {
  const { addEntry } = useHistory();
  const [source, setSource] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);
  const [result, setResult] = useState(null);
  const [diffParts, setDiffParts] = useState(null);

  const handleReplace = useCallback(() => {
    const { result: newResult, count, error } = doReplace(source, find, replace, caseInsensitive, regexMode);
    setResult({ text: newResult, count, error });
    const parts = highlightDiff(source, find, replace, caseInsensitive, regexMode);
    setDiffParts(parts);
    addEntry('Find & Replace');
  }, [source, find, replace, caseInsensitive, regexMode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">🔍</span>
        <h1 className="font-heading text-2xl font-bold text-text">Find & Replace</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Find</label>
              <input value={find} onChange={(e) => setFind(e.target.value)}
                placeholder="Text to find..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Replace with</label>
              <input value={replace} onChange={(e) => setReplace(e.target.value)}
                placeholder="Replacement text..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary" />
            </div>
          </div>
          <div>
            <textarea value={source} onChange={(e) => setSource(e.target.value)}
              placeholder="Paste source text here..."
              className="w-full h-36 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-text-tertiary" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={caseInsensitive} onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="accent-primary rounded" />
              Case insensitive
            </label>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={regexMode} onChange={(e) => setRegexMode(e.target.checked)}
                className="accent-primary rounded" />
              Regex mode
            </label>
            {regexMode && <span className="text-xs text-cat-text">Use regex patterns for advanced matching</span>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReplace} disabled={!source || !find}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              Replace
            </button>
            {result && result.count > 0 && (
              <span className="text-xs text-text-tertiary">{result.count} replacement{result.count !== 1 ? 's' : ''} made</span>
            )}
            {result && result.count === 0 && <span className="text-xs text-text-tertiary">No matches found</span>}
          </div>
        </div>
      </GlassCard>

      {result && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Result</span>
              <CopyButton text={result.text} />
            </div>
            <div className="bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border/50 whitespace-pre-wrap font-mono max-h-48 overflow-auto">
              {result.error ? (
                <span className="text-cat-text">{result.error}</span>
              ) : (
                result.text
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {diffParts && diffParts.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-2 block">Diff Preview (highlighted removed parts)</span>
            <div className="bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border/50 whitespace-pre-wrap font-mono max-h-48 overflow-auto">
              {diffParts.map((part, i) =>
                part.type === 'removed' ? (
                  <span key={i} className="bg-cat-text/20 text-cat-text line-through rounded px-0.5">{part.text}</span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
