'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function mdToHtml(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

export default function MdToHtmlPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');

  const output = useMemo(() => {
    if (!input.trim()) return '';
    addEntry('Markdown to HTML');
    return mdToHtml(input);
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">M→H</span>
        <h1 className="font-heading text-2xl font-bold text-text">Markdown to HTML</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Markdown Input</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={`# Hello World\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2\n\n[Link](https://example.com)`} />
          </div>
        </GlassCard>
        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Rendered HTML</span>
                {output && <CopyButton text={output} />}
              </div>
              <div className="bg-surface rounded-lg border border-border p-4 min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: output || '<span class="text-text-tertiary text-sm">Output will appear here...</span>' }} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">HTML Source</span>
              <textarea value={output} readOnly rows={6}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
                placeholder="HTML source will appear here..." />
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
