'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function mdToHtml(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-badge-bg text-cat-code px-1 rounded text-xs">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary pl-4 italic text-text-secondary">$1</blockquote>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-xl my-2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
    .replace(/^---+$/gm, '<hr class="border-border my-4" />')
    .replace(/^___+$/gm, '<hr class="border-border my-4" />');

  const lines = html.split('\n');
  const result = [];
  let inCodeBlock = false;
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        result.push('</pre>');
        inCodeBlock = false;
      } else {
        if (inUl) { result.push('</ul>'); inUl = false; }
        if (inOl) { result.push('</ol>'); inOl = false; }
        const lang = line.slice(3).trim();
        result.push(`<pre class="bg-bg rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed">`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)/);

    if (ulMatch) {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul class="list-disc pl-6 space-y-1 my-2">'); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    if (olMatch) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol class="list-decimal pl-6 space-y-1 my-2">'); inOl = true; }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    if (inUl) { result.push('</ul>'); inUl = false; }
    if (inOl) { result.push('</ol>'); inOl = false; }

    if (line.trim() === '') {
      result.push('');
      continue;
    }

    if (line.startsWith('<h') || line.startsWith('<bl') || line.startsWith('<hr') || line.startsWith('<im') || line.startsWith('<pr') || line.startsWith('</pre')) {
      result.push(line);
    } else {
      result.push(`<p class="my-1.5 leading-relaxed">${line}</p>`);
    }
  }

  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');
  if (inCodeBlock) result.push('</pre>');

  return result.join('\n');
}

const FONTS = { serif: "'Times New Roman', Georgia, serif", sans: "Arial, Helvetica, sans-serif", mono: "'Courier New', monospace" };

export default function MdToPdfPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('# Hello Markdown\n\nStart typing markdown here...\n\n- List item 1\n- List item 2\n- List item 3\n\n**Bold** and *italic* and `code`');
  const [pageSize, setPageSize] = useState('a4');
  const [font, setFont] = useState('serif');
  const [theme, setTheme] = useState('light');
  const html = useMemo(() => mdToHtml(input), [input]);

  const pageDims = pageSize === 'a4' ? '21cm 29.7cm' : '21.6cm 27.9cm';

  const downloadPdf = () => {
    addEntry('Markdown to PDF');
    const isDark = theme === 'dark';
    const txt = isDark ? '#e5e7eb' : '#1A1A2E';
    const bg = isDark ? '#0f172a' : '#ffffff';
    const codeBg = isDark ? '#1e293b' : '#f5f5f5';
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>markdown-export</title>
        <style>
          @page { size: ${pageDims}; margin: 2cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${FONTS[font]};
            font-size: 12pt;
            line-height: 1.6;
            color: ${txt};
            background: ${bg};
            padding: 0;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 24pt; margin: 20pt 0 10pt; font-weight: bold; }
          h2 { font-size: 20pt; margin: 16pt 0 8pt; }
          h3 { font-size: 16pt; margin: 14pt 0 6pt; }
          h4 { font-size: 14pt; margin: 12pt 0 6pt; }
          h5, h6 { font-size: 12pt; margin: 10pt 0 4pt; font-weight: bold; }
          p { margin: 6pt 0; }
          ul, ol { padding-left: 24pt; margin: 6pt 0; }
          li { margin: 2pt 0; }
          code { background: ${codeBg}; padding: 1pt 4pt; border-radius: 3pt; font-size: 10pt; font-family: monospace; }
          pre { background: ${codeBg}; padding: 10pt; border-radius: 4pt; overflow-x: auto; font-size: 10pt; font-family: monospace; margin: 8pt 0; white-space: pre-wrap; }
          blockquote { border-left: 3pt solid #6C5CE7; padding-left: 12pt; color: #555; font-style: italic; margin: 8pt 0; }
          hr { border: none; border-top: 1pt solid #ccc; margin: 16pt 0; }
          img { max-width: 100%; }
          a { color: #6C5CE7; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⇧</span>
        <h1 className="font-heading text-2xl font-bold text-text">Markdown to PDF</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-surface rounded-2xl border border-border p-4">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Markdown</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-80 bg-bg rounded-xl p-3 text-sm font-mono text-text resize-none outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-tertiary">{input.length} chars</span>
                <div className="flex gap-2">
                  <CopyButton text={input} />
                  <button onClick={downloadPdf}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all cursor-pointer">
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-4">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Preview</label>
              <div className="h-80 overflow-y-auto bg-bg rounded-xl p-4 text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:font-heading [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:font-heading [&_h2]:mb-1.5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:font-heading [&_h3]:mb-1">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Font</label>
              <select value={font} onChange={(e) => setFont(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="serif">Serif</option>
                <option value="sans">Sans</option>
                <option value="mono">Mono</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Theme</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
