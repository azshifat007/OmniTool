'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function UnicodeInspectorPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [chars, setChars] = useState([]);

  const handleInspect = useCallback(() => {
    if (!input) { setChars([]); return; }
    const results = [];
    for (const ch of input) {
      const code = ch.codePointAt(0);
      const hex = code.toString(16).toUpperCase().padStart(4, '0');
      const category = getCategory(code);
      results.push({ char: ch, code, hex, category, escaped: `\\u{${hex}}` });
    }
    setChars(results);
    addEntry('Unicode Inspector');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-text">U+</span>
        <h1 className="font-heading text-2xl font-bold text-text">Unicode Inspector</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-3 block">Enter text to inspect</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); }} rows={4}
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="Paste any text here..." />
          <button onClick={handleInspect} disabled={!input}
            className="mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
            Inspect
          </button>
        </div>
      </GlassCard>

      {chars.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="text-xs text-text-tertiary mb-3">{chars.length} character{chars.length > 1 ? 's' : ''}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-text-tertiary border-b border-border">
                      <th className="text-left py-2 pr-4">Char</th>
                      <th className="text-left py-2 pr-4">Code Point</th>
                      <th className="text-left py-2 pr-4">Hex</th>
                      <th className="text-left py-2 pr-4">Category</th>
                      <th className="text-left py-2 pr-4">Escaped</th>
                      <th className="text-right py-2"><CopyButton text={chars.map(c => c.escaped).join('')} /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {chars.map((c, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                        <td className="py-2 pr-4 text-xl font-mono">{c.char === ' ' ? <span className="text-text-tertiary">␣</span> : c.char}</td>
                        <td className="py-2 pr-4 font-mono text-text">U+{c.hex}</td>
                        <td className="py-2 pr-4 font-mono text-text-secondary">{c.code}</td>
                        <td className="py-2 pr-4"><span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">{c.category}</span></td>
                        <td className="py-2 pr-4 font-mono text-xs text-text-tertiary">{c.escaped}</td>
                        <td className="py-2 text-right"><CopyButton text={c.char} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}

function getCategory(code) {
  if (code < 0x80) return 'ASCII';
  if (code >= 0x80 && code < 0x100) return 'Latin-1';
  if (code >= 0x100 && code < 0x400) return 'Latin Extended';
  if (code >= 0x370 && code < 0x400) return 'Greek';
  if (code >= 0x400 && code < 0x530) return 'Cyrillic';
  if (code >= 0x4E00 && code < 0xA000) return 'CJK';
  if (code >= 0xAC00 && code < 0xD800) return 'Hangul';
  if (code >= 0xD800 && code < 0xE000) return 'Surrogate';
  if (code >= 0xE000 && code < 0xF900) return 'Private Use';
  if (code >= 0x10000 && code < 0x20000) return 'SMP';
  if (code >= 0x20000) return 'SIP/TIP';
  if (code >= 0x2000 && code < 0x2070) return 'Punctuation';
  if (code >= 0x2070 && code < 0x2100) return 'Superscript';
  if (code >= 0x2100 && code < 0x2150) return 'Letterlike';
  if (code >= 0x2150 && code < 0x2200) return 'Number Forms';
  if (code >= 0x2200 && code < 0x2300) return 'Math';
  if (code >= 0x2460 && code < 0x2500) return 'Enclosed';
  if (code >= 0x2500 && code < 0x2580) return 'Box Drawing';
  if (code >= 0x2580 && code < 0x2600) return 'Block Elements';
  if (code >= 0x2600 && code < 0x2700) return 'Misc Symbols';
  if (code >= 0x2700 && code < 0x27C0) return 'Dingbats';
  return 'Other';
}
