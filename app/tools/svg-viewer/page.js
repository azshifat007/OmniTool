'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const PRESETS = {
  Circle: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#6C5CE7" stroke="#4834d4" stroke-width="3"/>
</svg>`,
  Rectangle: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="60" rx="8" fill="#00b894" stroke="#00a381" stroke-width="3"/>
</svg>`,
  Star: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,5 61,38 95,38 68,60 79,95 50,75 21,95 32,60 5,38 39,38" fill="#fdcb6e" stroke="#e17055" stroke-width="2"/>
</svg>`,
  Heart: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 88 C20 65 0 50 0 32 C0 15 15 5 28 15 L50 35 L72 15 C85 5 100 15 100 32 C100 50 80 65 50 88Z" fill="#e17055" stroke="#d63031" stroke-width="2"/>
</svg>`,
};

function getSvgDimensions(svgStr) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return null;
    const dims = {};
    const vb = svg.getAttribute('viewBox');
    const w = svg.getAttribute('width');
    const h = svg.getAttribute('height');
    if (vb) {
      const parts = vb.trim().split(/\s+/).map(Number);
      if (parts.length === 4) dims.viewBox = `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
    }
    if (w) dims.width = w;
    if (h) dims.height = h;
    return Object.keys(dims).length ? dims : null;
  } catch {
    return null;
  }
}

export default function SvgViewerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [rendered, setRendered] = useState(null);
  const [error, setError] = useState('');
  const [darkBg, setDarkBg] = useState(false);
  const [dimensions, setDimensions] = useState(null);

  const handleRender = useCallback(() => {
    setError('');
    const trimmed = input.trim();
    if (!trimmed) { setRendered(null); setDimensions(null); return; }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) throw new Error('Invalid SVG markup');
      const svgEl = doc.querySelector('svg');
      if (!svgEl) throw new Error('No <svg> element found in markup');
      setRendered(trimmed);
      setDimensions(getSvgDimensions(trimmed));
      addEntry('SVG Viewer');
    } catch (e) {
      setError(e.message);
      setRendered(null);
      setDimensions(null);
    }
  }, [input, addEntry]);

  const loadPreset = (name) => {
    setInput(PRESETS[name]);
    setRendered(null);
    setDimensions(null);
    setError('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">◇</span>
        <h1 className="font-heading text-2xl font-bold text-text">SVG Viewer</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <label className="text-xs text-text-tertiary mb-3 block">SVG Code</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder={'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" fill="#6C5CE7"/>\n</svg>'} />
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESETS).map((name) => (
                  <button key={name} onClick={() => loadPreset(name)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-tertiary hover:text-text border border-border hover:border-primary transition-all cursor-pointer">
                    {name}
                  </button>
                ))}
              </div>
              <button onClick={handleRender}
                className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                Render
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Preview</span>
                <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer select-none">
                  <input type="checkbox" checked={darkBg} onChange={(e) => setDarkBg(e.target.checked)}
                    className="accent-primary" />
                  Dark BG
                </label>
              </div>
              <div className={`w-full min-h-[200px] rounded-xl border border-border flex items-center justify-center p-4 overflow-auto transition-colors ${darkBg ? 'bg-gray-900' : 'bg-white'}`}>
                {rendered ? (
                  <div dangerouslySetInnerHTML={{ __html: rendered }} />
                ) : (
                  <span className="text-xs text-text-tertiary">Preview will appear here</span>
                )}
              </div>
              {dimensions && (
                <div className="mt-3 flex gap-4 text-xs font-mono text-text-tertiary">
                  {dimensions.width && <span>Width: {dimensions.width}</span>}
                  {dimensions.height && <span>Height: {dimensions.height}</span>}
                  {dimensions.viewBox && <span>ViewBox: {dimensions.viewBox}</span>}
                </div>
              )}
            </div>
          </GlassCard>

          {rendered && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">SVG Code</span>
                  <CopyButton text={rendered} />
                </div>
                <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre max-h-[200px]">{rendered}</pre>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
