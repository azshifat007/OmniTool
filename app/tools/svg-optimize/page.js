'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function optimizeSvg(svg, options) {
  let result = svg;
  if (options.removeComments) result = result.replace(/<!--[\s\S]*?-->/g, '');
  if (options.removeMetadata) result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  if (options.removeEditorData) result = result.replace(/<(?:sodipodi|inkscape):[^>]*\/>/gi, '');
  if (options.collapseWhitespace) {
    result = result.replace(/>\s+</g, '><');
    result = result.replace(/\s{2,}/g, ' ');
  }
  if (options.removeEmptyAttributes) {
    result = result.replace(/ ([a-z-]+)="" /gi, ' ');
  }
  if (options.removeUnusedDefs) {
    result = result.replace(/<defs>\s*<\/defs>/gi, '');
  }
  if (options.simplifyColors) {
    result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/gi, '#$1$2$3');
  }
  if (options.roundNumbers) {
    result = result.replace(/(\d+\.\d{3,})/g, (m) => parseFloat(m).toFixed(2));
  }
  if (options.removeXmlDecl) {
    result = result.replace(/<\?xml[^?]*\?>/gi, '');
  }
  if (options.removeDoctype) {
    result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
  }
  return result.trim();
}

export default function SvgOptimizePage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    removeEditorData: true,
    collapseWhitespace: true,
    removeEmptyAttributes: true,
    removeUnusedDefs: true,
    simplifyColors: true,
    roundNumbers: false,
    removeXmlDecl: true,
    removeDoctype: false,
  });
  const fileRef = useRef(null);

  const handleOptimize = useCallback(() => {
    if (!input.trim()) { setOutput(''); setStats(null); return; }
    try {
      const result = optimizeSvg(input, options);
      setOutput(result);
      setStats({
        original: new Blob([input]).size,
        optimized: new Blob([result]).size,
        saved: ((1 - new Blob([result]).size / new Blob([input]).size) * 100).toFixed(1),
      });
      setError('');
      addEntry('SVG Optimizer');
    } catch (e) {
      setError(e.message);
      setOutput('');
      setStats(null);
    }
  }, [input, options, addEntry]);

  const handleFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => setInput(e.target.result);
    reader.readAsText(file);
  }, []);

  const toggle = (key) => setOptions(o => ({ ...o, [key]: !o[key] }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">◇</span>
        <h1 className="font-heading text-2xl font-bold text-text">SVG Optimizer</h1>
      </div>

      <GlassCard className="mb-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary font-semibold block mb-3">Optimization Options</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries({
              removeComments: 'Remove Comments',
              removeMetadata: 'Remove Metadata',
              removeEditorData: 'Remove Editor Data',
              collapseWhitespace: 'Collapse Whitespace',
              removeEmptyAttributes: 'Remove Empty Attrs',
              removeUnusedDefs: 'Remove Unused Defs',
              simplifyColors: 'Simplify Colors',
              roundNumbers: 'Round Numbers',
              removeXmlDecl: 'Remove XML Decl',
              removeDoctype: 'Remove Doctype',
            }).map(([key, label]) => (
              <button key={key} onClick={() => toggle(key)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  options[key] ? 'bg-primary text-white' : 'text-text-tertiary bg-surface border border-border'
                }`}>{label}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Input SVG</span>
              <div className="flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-text-tertiary hover:text-text bg-surface border border-border transition-all cursor-pointer">
                  Load File
                </button>
                <input ref={fileRef} type="file" accept=".svg" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
                {input && <CopyButton text={input} />}
              </div>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste SVG code or load a file..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Optimized Output</span>
              <div className="flex items-center gap-2">
                <button onClick={handleOptimize}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                  Optimize
                </button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Optimized SVG will appear here..." />
          </div>
        </GlassCard>
      </div>

      {stats && (
        <GlassCard className="mt-5">
          <div className="p-4 flex items-center gap-6">
            <span className="text-xs text-text-tertiary font-semibold">Stats</span>
            <span className="text-xs text-text">Original: {stats.original.toLocaleString()} B</span>
            <span className="text-xs text-text">Optimized: {stats.optimized.toLocaleString()} B</span>
            <span className={`text-xs font-semibold ${parseFloat(stats.saved) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(stats.saved) > 0 ? `↓ ${stats.saved}% saved` : `↑ ${Math.abs(stats.saved)}% larger`}
            </span>
          </div>
        </GlassCard>
      )}

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
