'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const styles = {
  simple: {
    name: 'Simple',
    chars: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
  },
  block: {
    name: 'Block',
    chars: [' ', '░', '▒', '▓', '█'],
  },
  shade: {
    name: 'Shade',
    chars: [' ', '·', '∘', '●', '◉', '◎', '◍', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '■'],
  },
  braille: {
    name: 'Braille',
    chars: [' ', '⡀', '⡄', '⡆', '⡇', '⣇', '⣧', '⣷', '⣿'],
  },
  matrix: {
    name: 'Matrix',
    chars: [' ', '｡', '｢', '｣', '､', '･', 'ｦ', 'ｧ', 'ｨ', 'ｩ', 'ｪ', 'ｫ', 'ｬ', 'ｭ', 'ｮ', 'ｯ'],
  },
};

function toAscii(text, style, width, brightness = 1, invert = false) {
  const chars = styles[style].chars;
  const lines = text.split('\n');
  const maxLen = Math.max(...lines.map((l) => l.length));
  if (maxLen === 0) return '';
  const charWidth = Math.min(width, 120);
  const scale = charWidth / maxLen;
  return lines.map((line) => {
    let result = '';
    for (let i = 0; i < line.length * scale; i++) {
      const srcIdx = Math.floor(i / scale);
      const charCode = line.charCodeAt(srcIdx) || 32;
      let v = (charCode / 255) * brightness;
      v = Math.max(0, Math.min(1, v));
      if (invert) v = 1 - v;
      const idx = Math.floor(v * (chars.length - 1));
      result += chars[Math.min(idx, chars.length - 1)];
    }
    return result;
  }).join('\n');
}

const presets = [
  'Hello, World!',
  'ASCII ART',
  'Code is poetry',
  '  ___\n / _ \\\n| | | |\n| |_| |\n \\___/',
];

export default function AsciiArtPage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('Hello, World!');
  const [style, setStyle] = useState('simple');
  const [width, setWidth] = useState(60);
  const [brightness, setBrightness] = useState(1);
  const [invert, setInvert] = useState(false);

  const art = useMemo(() => toAscii(text, style, width, brightness, invert), [text, style, width, brightness, invert]);

  const download = useCallback(() => {
    const blob = new Blob([art], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [art]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-fun">▓</span>
        <h1 className="font-heading text-2xl font-bold text-text">ASCII Art Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Input Text</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Style</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(styles).map(([key, s]) => (
                  <button key={key} onClick={() => setStyle(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      style === key ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                    }`}
                  >{s.name}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Width: {width}</label>
              <input type="range" min={20} max={200} value={width} onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full accent-primary" />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Brightness: {brightness.toFixed(2)}</label>
              <input type="range" min={0.2} max={2} step={0.05} value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full accent-primary" />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setInvert((v) => !v)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${invert ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>
                {invert ? 'Inverted' : 'Invert'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p} onClick={() => setText(p)}
                  className="text-[10px] px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer font-mono">
                  {p.replace(/\n/g, '\\n')}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              <div className="flex items-center gap-2">
                <button onClick={download}
                  className="text-xs px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">Download</button>
                <CopyButton text={art} />
              </div>
            </div>
            <pre className="bg-surface rounded-lg p-3 text-xs font-mono leading-tight text-text border border-border overflow-x-auto whitespace-pre min-h-[200px]">{art || ' '}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
