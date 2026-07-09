'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const FONTS = [
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New',
  'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
  'monospace', 'sans-serif', 'serif',
];

const WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '600', label: 'Semibold (600)' },
  { value: '700', label: 'Bold (700)' },
];

export default function FontPreviewPage() {
  const { addEntry } = useHistory();
  const [font, setFont] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [weight, setWeight] = useState('normal');
  const [style, setStyle] = useState('normal');
  const [transform, setTransform] = useState('none');
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog.');

  const cssCode = `font-family: '${font}';
font-size: ${fontSize}px;
font-weight: ${weight};
font-style: ${style};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
text-transform: ${transform};`;

  const previewStyle = {
    fontFamily: font,
    fontSize: `${fontSize}px`,
    fontWeight: weight,
    fontStyle: style,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    textTransform: transform,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">Aa</span>
        <h1 className="font-heading text-2xl font-bold text-text">Font Preview</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Font Family</label>
                <select value={font} onChange={(e) => setFont(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Font Size: {fontSize}px</label>
                  <input type="range" min={10} max={72} value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Line Height: {lineHeight.toFixed(1)}</label>
                  <input type="range" min={1} max={2} step={0.1} value={lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Letter Spacing: {letterSpacing}px</label>
                <input type="range" min={-2} max={10} step={0.5} value={letterSpacing}
                  onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Weight</label>
                  <select value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    {WEIGHTS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Style</label>
                  <div className="flex gap-2">
                    {['normal', 'italic'].map((s) => (
                      <button key={s} onClick={() => setStyle(s)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          style === s ? 'bg-primary text-white' : 'bg-surface text-text-tertiary border border-border hover:text-text'
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Transform</label>
                  <select value={transform} onChange={(e) => setTransform(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                    <option value="none">None</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">CSS Code</span>
                <CopyButton text={cssCode} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre">{cssCode}</pre>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preview Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your preview text here..."
                className="w-full h-24 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
              <div className="w-full min-h-[200px] bg-surface rounded-xl border border-border p-6 overflow-auto" style={previewStyle}>
                {text || <span className="text-text-tertiary">Preview text will appear here</span>}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
