'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function toSlug(text, separator, lowercase) {
  let s = text.trim();
  if (!s) return '';
  s = s.replace(/[^\w\s-]/g, '');
  s = s.replace(/[\s_]+/g, '-');
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (separator === '_') s = s.replace(/-/g, '_');
  return lowercase ? s.toLowerCase() : s;
}

function toCamel(text) {
  const words = text.match(/[a-zA-Z0-9]+/g) || [];
  if (words.length === 0) return '';
  const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return camel;
}

export default function SlugifyPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);

  const slug = toSlug(input, separator, lowercase);
  const slugUpper = toSlug(input, separator, false);
  const camelCase = toCamel(input || slug);

  useEffect(() => {
    if (input.trim()) {
      addEntry('Slugify');
    }
  }, [input, separator, lowercase]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">🔗</span>
        <h1 className="font-heading text-2xl font-bold text-text">Slugify</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Text to slugify</label>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type text here..."
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-text-tertiary" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Separator:</span>
              {['-', '_'].map((sep) => (
                <button key={sep} onClick={() => setSeparator(sep)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all cursor-pointer ${
                    separator === sep ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>
                  {sep}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)}
                className="accent-primary rounded" />
              Lowercase
            </label>
          </div>
        </div>
      </GlassCard>

      {input.trim() && (
        <div className="space-y-3">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Slug (lowercase)</span>
                <CopyButton text={slug} />
              </div>
              <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                {slug || <span className="text-text-tertiary">—</span>}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Slug (original case)</span>
                <CopyButton text={slugUpper} />
              </div>
              <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                {slugUpper || <span className="text-text-tertiary">—</span>}
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">camelCase</span>
                <CopyButton text={camelCase} />
              </div>
              <div className="text-sm font-mono text-text break-all bg-surface rounded-lg px-3 py-2 border border-border/50">
                {camelCase || <span className="text-text-tertiary">—</span>}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
}
