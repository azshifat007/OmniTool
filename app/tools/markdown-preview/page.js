'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_MD = `# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text* and ~~strikethrough~~

[Link to GitHub](https://github.com)

![Alt text](https://placehold.co/400x100)

- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

\`inline code\`

\`\`\`
// code block
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> Blockquote

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

---

Normal paragraph text.`;

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown(md) {
  if (!md) return '';
  let html = escapeHtml(md);

  html = html.replace(/^#{1,6}\s+(.+)$/gm, (m, content) => {
    const level = m.trim().indexOf(' ');
    return `<h${level}>${content}</h${level}>`;
  });

  html = html.replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>');
  html = html.replace(/(\*|_)(.+?)\1/g, '<em>$2</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;" />');

  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--surface);padding:2px 6px;border-radius:4px;font-size:0.9em;">$1</code>');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;overflow-x:auto;font-size:0.85rem;"><code>${escapeHtml(code)}</code></pre>`;
  });

  html = html.replace(/^( {0,3})[-*+]\s+(.+)$/gm, (_, indent, content) => {
    const depth = indent.length ? Math.floor(indent.replace(/   /g, '\t').length / 3 + 1) : 1;
    return `${'\t'.repeat(depth)}- [__]${content}`;
  });

  html = html.replace(/^\d+\.\s+(.+)$/gm, '<ol><li>$1</li></ol>');
  html = html.replace(/(<ol>[\s\S]*?<\/ol>)/g, (m) => m.replace(/<\/ol>\s*<ol>/g, ''));

  html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left:3px solid var(--primary);padding:4px 12px;margin:8px 0;background:var(--surface);border-radius:4px;"><p>$1</p></blockquote>');

  html = html.replace(/^\|(.+)\|$/gm, (m) => {
    const cells = m.slice(1, -1).split('|').map(c => c.trim());
    const isHeader = cells.every(c => /^-{1,}$/.test(c));
    if (isHeader) return '<!-- table header sep -->';
    return `<tr>${cells.map(c => `<td style="border:1px solid var(--border);padding:6px 12px;">${c}</td>`).join('')}</tr>`;
  });
  html = html.replace(/<tr>.*?<\/tr>/g, (m, offset) => {
    const before = html.slice(0, offset);
    const headerLines = before.split('<!-- table header sep -->').length;
    if (headerLines === 1) return `<table style="border-collapse:collapse;width:100%;margin:8px 0;"><thead>${m.replace(/<td/g, '<th').replace(/<\/td>/g, '</th>')}</thead>`;
    if (headerLines === 2) return `<tbody>${m}</tbody>`;
    return m;
  });
  html = html.replace(/<\/thead>\s*<tbody>/g, '');
  html = html.replace(/<table[\s\S]*?<\/table>/g, (m) => {
    if (!m.includes('</thead>')) return m;
    if (!m.includes('</tbody>')) return m + '</tbody>';
    return m;
  });

  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:16px 0;" />');

  html = html.replace(/\n{2,}/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

export default function MarkdownPreviewPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_MD);
  const [view, setView] = useState('split');

  const renderedHtml = renderMarkdown(input);

  const handleChange = useCallback((e) => {
    setInput(e.target.value);
    addEntry('Markdown Preview');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">[MD]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Markdown Preview</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {['editor', 'preview', 'split'].map((t) => (
                <button key={t} onClick={() => setView(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    view === t ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-text-tertiary">{input.length} chars</span>
              <CopyButton text={input} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="min-h-[500px]">
        {(view === 'editor' || view === 'split') && (
          <div className={view === 'split' ? 'w-1/2 float-left pr-2' : 'w-full'}>
            <GlassCard>
              <div className="p-4">
                <label className="text-xs text-text-tertiary mb-3 block">Markdown Source</label>
                <textarea value={input} onChange={handleChange} rows={22}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Type Markdown here..." />
              </div>
            </GlassCard>
          </div>
        )}
        {(view === 'preview' || view === 'split') && (
          <div className={view === 'split' ? 'w-1/2 float-left pl-2' : 'w-full'}>
            <GlassCard>
              <div className="p-4">
                <label className="text-xs text-text-tertiary mb-3 block">Rendered Preview</label>
                <div className="bg-white rounded-lg border border-border p-4 min-h-[520px] prose prose-sm max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>
            </GlassCard>
          </div>
        )}
        <div style={{ clear: 'both' }} />
      </div>
    </motion.div>
  );
}
