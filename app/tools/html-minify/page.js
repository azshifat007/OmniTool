'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';

function minify(html, opts) {
  let h = html;
  if (opts.removeComments) h = h.replace(/<!--[\s\S]*?-->/g, '');
  if (opts.collapseWhitespace) {
    h = h.replace(/>\s+</g, '><');
    h = h.replace(/^[^\S\n]+|[^\S\n]+$/gm, '');
    h = h.replace(/\n{3,}/g, '\n\n');
  }
  if (opts.removeQuotes) {
    h = h.replace(/\s([a-z-]+)="([a-z0-9\-\s]+)"/gi, (m, attr, val) => {
      if (/^[a-z0-9\-\s]+$/i.test(val) && !val.includes(' ')) return ` ${attr}=${val}`;
      return m;
    });
  }
  return h.trim();
}

export default function HtmlMinifyPage() {
  const [input, setInput] = useState('');
  const [opts, setOpts] = useState({ removeComments: true, collapseWhitespace: true, removeQuotes: false });
  const output = minify(input, opts);
  const savings = input.length ? Math.round((1 - output.length / input.length) * 100) : 0;

  const toggle = (k) => setOpts(p => ({ ...p, [k]: !p[k] }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">Hm</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML Minifier</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            {[{k:'removeComments',l:'Remove comments'},{k:'collapseWhitespace',l:'Collapse whitespace'},{k:'removeQuotes',l:'Remove optional quotes'}].map(({k,l}) => (
              <label key={k} className="flex items-center gap-1.5 text-sm text-text cursor-pointer">
                <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} className="accent-primary rounded cursor-pointer" />
                {l}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Input ({input.length} chars)</label>
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste HTML here..." rows={10}
                className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono resize-none outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-text-tertiary">Output ({output.length} chars)</label>
                {input && <CopyButton text={output} />}
              </div>
              <div className="w-full h-[272px] bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm font-mono overflow-auto whitespace-pre-wrap break-all">
                {output || <span className="text-text-tertiary">Minified HTML will appear here</span>}
              </div>
            </div>
          </div>
          {input && (
            <div className="text-xs text-text-tertiary">
              {savings > 0 ? `Reduced by ${savings}% (${(input.length - output.length).toLocaleString()} chars saved)` : 'No reduction possible'}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
