'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const FONTS = {
  serif: "'Times New Roman', Georgia, serif",
  sans: "Arial, Helvetica, sans-serif",
  mono: "'Courier New', monospace",
};

const ALIGNS = { left: 'left', center: 'center', right: 'right', justify: 'justify' };

export default function TextToPdfPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Start typing plain text here...\n\nIt will be exported as a clean PDF.');
  const [pageSize, setPageSize] = useState('a4');
  const [font, setFont] = useState('sans');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [align, setAlign] = useState('left');
  const [title, setTitle] = useState('');

  const pageDims = pageSize === 'a4' ? '21cm 29.7cm' : '21.6cm 27.9cm';

  const renderText = (raw) => raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .split('\n\n')
    .map(block => `<p class="block">${block.split('\n').join('<br/>')}</p>`)
    .join('');

  const downloadPdf = () => {
    addEntry('Text to PDF');
    const isDark = theme === 'dark';
    const txt = isDark ? '#e5e7eb' : '#1A1A2E';
    const bg = isDark ? '#0f172a' : '#ffffff';
    const heading = title.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>text-export</title>
        <style>
          @page { size: ${pageDims}; margin: 2cm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${FONTS[font]};
            font-size: ${fontSize}pt;
            line-height: ${lineHeight};
            color: ${txt};
            background: ${bg};
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: ${fontSize * 2}pt; margin: 0 0 20pt; font-weight: bold; text-align: ${ALIGNS[align]}; }
          .block { margin: 0 0 ${fontSize}pt; text-align: ${ALIGNS[align]}; }
        </style>
      </head>
      <body>
        ${heading ? `<h1>${heading}</h1>` : ''}
        ${renderText(input)}
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">T↓</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text to PDF</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="bg-surface rounded-2xl border border-border p-4">
            <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title (printed as a heading)"
              className="w-full bg-bg rounded-xl px-3 py-2 text-sm text-text border border-border outline-none placeholder:text-text-tertiary"
            />
            <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2 block mt-4">Text</label>
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

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Font Size ({fontSize}pt)</label>
              <input type="range" min="8" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer mt-2.5" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Line Height ({lineHeight.toFixed(1)})</label>
              <input type="range" min="1" max="2.5" step="0.1" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer mt-2.5" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Alignment</label>
              <select value={align} onChange={(e) => setAlign(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
