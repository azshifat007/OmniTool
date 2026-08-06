'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const PATTERNS = [
  { label: 'Email', regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: 'Standard email addresses' },
  { label: 'URL', regex: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/\\w\\-.~:/?#[\\]@!$&\'()*+,;=%]*', desc: 'HTTP/HTTPS URLs' },
  { label: 'Phone (US)', regex: '^\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$', desc: 'US phone numbers' },
  { label: 'IPv4', regex: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'IPv4 addresses' },
  { label: 'IPv6', regex: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', desc: 'IPv6 addresses' },
  { label: 'Date (YYYY-MM-DD)', regex: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', desc: 'ISO date format' },
  { label: 'Time (HH:MM)', regex: '^([01]\\d|2[0-3]):[0-5]\\d$', desc: '24-hour time format' },
  { label: 'Hex Color', regex: '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', desc: 'CSS hex color codes' },
  { label: 'Credit Card', regex: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$', desc: 'Visa, MasterCard, Amex' },
  { label: 'Username', regex: '^[a-zA-Z0-9_-]{3,20}$', desc: 'Alphanumeric with _ and -' },
  { label: 'Strong Password', regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', desc: 'Min 8 chars, upper, lower, digit, special' },
  { label: 'HTML Tag', regex: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>', desc: 'Match HTML tags' },
  { label: 'Markdown Link', regex: '\\[([^\\]]+)\\]\\(([^)]+)\\)', desc: 'Markdown [text](url) links' },
  { label: 'File Path', regex: '^(\\/[\\w.-]+)+$', desc: 'Unix-style file paths' },
  { label: 'Slug', regex: '^[a-z0-9]+(?:-[a-z0-9]+)*$', desc: 'URL slug format' },
];

const BUILD_BLOCKS = [
  { label: 'Any digit', regex: '\\d' },
  { label: 'Any letter', regex: '[a-zA-Z]' },
  { label: 'Any word char', regex: '\\w' },
  { label: 'Whitespace', regex: '\\s' },
  { label: 'Any char', regex: '.' },
  { label: 'Start of line', regex: '^' },
  { label: 'End of line', regex: '$' },
  { label: 'One or more', regex: '+' },
  { label: 'Zero or more', regex: '*' },
  { label: 'Optional', regex: '?' },
  { label: 'Exactly 3', regex: '{3}' },
  { label: '3 to 6', regex: '{3,6}' },
  { label: 'Group', regex: '(abc)' },
  { label: 'Or', regex: '|' },
  { label: 'Not', regex: '[^abc]' },
];

export default function RegexGenPage() {
  const { addEntry } = useHistory();
  const [regex, setRegex] = useState('');
  const [testStr, setTestStr] = useState('');
  const [flags, setFlags] = useState('g');
  const [mode, setMode] = useState('presets');

  const matches = (() => {
    if (!regex || !testStr) return [];
    try {
      const r = new RegExp(regex, flags);
      const results = [];
      let m;
      const rForMatch = new RegExp(regex, flags.includes('g') ? flags : flags + 'g');
      while ((m = rForMatch.exec(testStr)) !== null) {
        results.push({ value: m[0], index: m.index });
        if (!flags.includes('g')) break;
        if (m[0].length === 0) rForMatch.lastIndex++;
      }
      return results;
    } catch {
      return [];
    }
  }, [regex, testStr, flags]);

  const highlight = (() => {
    if (!testStr || matches.length === 0) return null;
    let result = '';
    let last = 0;
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    for (const m of sorted) {
      result += testStr.slice(last, m.index);
      result += `<mark class="bg-yellow-200 text-text rounded px-0.5">${testStr.slice(m.index, m.index + m.value.length)}</mark>`;
      last = m.index + m.value.length;
    }
    result += testStr.slice(last);
    return result;
  }, [testStr, matches]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Regex Generator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex gap-2">
            {['presets', 'builder'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{m === 'presets' ? 'Presets' : 'Builder'}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      {mode === 'presets' && (
        <GlassCard className="mb-5">
          <div className="p-4">
            <span className="text-xs text-text-tertiary font-semibold block mb-3">Common Patterns</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PATTERNS.map(p => (
                <button key={p.label} onClick={() => { setRegex(p.regex); addEntry('Regex Generator'); }}
                  className="text-left p-2.5 rounded-lg bg-surface border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                  <div className="text-xs font-semibold text-text">{p.label}</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {mode === 'builder' && (
        <GlassCard className="mb-5">
          <div className="p-4">
            <span className="text-xs text-text-tertiary font-semibold block mb-3">Click to Insert</span>
            <div className="flex flex-wrap gap-1.5">
              {BUILD_BLOCKS.map(b => (
                <button key={b.label} onClick={() => setRegex(r => r + b.regex)}
                  className="px-2 py-1 text-[11px] font-mono rounded-md bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                  title={b.label}>
                  {b.regex}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Regex Pattern</span>
              {regex && <CopyButton text={regex} />}
            </div>
            <input value={regex} onChange={e => setRegex(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter or select a regex pattern..." />
            <div className="flex gap-2 mt-3">
              {['g', 'i', 'm', 's'].map(f => (
                <button key={f} onClick={() => setFlags(fl => fl.includes(f) ? fl.replace(f, '') : fl + f)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                    flags.includes(f) ? 'bg-primary text-white' : 'text-text-tertiary bg-surface border border-border'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Test String</span>
              <span className="text-[10px] text-text-tertiary">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
            <textarea value={testStr} onChange={e => setTestStr(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter text to test against..." />
          </div>
        </GlassCard>
      </div>

      {highlight && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <span className="text-xs text-text-tertiary font-semibold block mb-2">Highlighted Matches</span>
            <div className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: highlight }} />
          </div>
        </GlassCard>
      )}

      {regex && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary font-semibold">Generated Regex</span>
              <CopyButton text={`/${regex}/${flags}`} />
            </div>
            <code className="text-sm font-mono text-primary block">/{regex}/{flags}</code>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
