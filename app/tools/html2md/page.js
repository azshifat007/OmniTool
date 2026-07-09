'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function html2md(html) {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gis, (_, c) => c.replace(/<code[^>]*>/g, '').replace(/<\/code>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"'));
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, q) => q.replace(/^/gm, '> ') + '\n\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, c) => {
    const parent = html.match(new RegExp(`<ul[^>]*>.*?${_.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</ul>`, 'is'));
    return (parent ? '- ' : '1. ') + c.trim() + '\n';
  });
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<\/?u[^>]*>/gi, '');
  md = md.replace(/<\/?span[^>]*>/gi, '');
  md = md.replace(/<\/?div[^>]*>/gi, '');
  md = md.replace(/<\/?ul[^>]*>/gi, '');
  md = md.replace(/<\/?ol[^>]*>/gi, '');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

const examples = [
  ['Simple', '<h1>Hello World</h1><p>This is a <strong>paragraph</strong> with a <a href="https://example.com">link</a>.</p>'],
  ['List', '<ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>'],
  ['Mixed', '<h2>Article Title</h2><p>Some <em>italic</em> text and <code>inline code</code>.</p><blockquote>A wise quote</blockquote><p><img src="https://example.com/img.png" alt="Photo"></p>'],
];

export default function Html2mdPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    setOutput(html2md(input));
    addEntry('HTML to Markdown');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">H↓</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML to Markdown</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-tertiary">HTML Input</label>
            <button onClick={convert} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder="Paste HTML here..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      {output && (
        <GlassCard className="mt-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Markdown Output</span>
              <CopyButton text={output} />
            </div>
            <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap break-all max-h-96 overflow-y-auto">{output}</pre>
          </div>
        </GlassCard>
      )}

      <GlassCard className="mt-4">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">Examples</span>
          <div className="flex flex-wrap gap-2">
            {examples.map(([name, html]) => (
              <button key={name} onClick={() => { setInput(html); setOutput(''); }}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:border-primary/40 transition-all cursor-pointer">
                {name}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
