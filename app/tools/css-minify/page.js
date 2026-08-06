'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_CSS = `/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}`;

function minifyCss(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*/g, '')
    .replace(/\s+$/gm, '')
    .replace(/^\s+/gm, '')
    .trim();
}

export default function CssMinifyPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_CSS);
  const [output, setOutput] = useState('');

  const originalSize = input.length;
  const minifiedSize = output.length;
  const bytesSaved = originalSize - minifiedSize;
  const percentSaved = originalSize ? ((bytesSaved / originalSize) * 100).toFixed(1) : 0;

  const handleMinify = useCallback(() => {
    if (!input.trim()) { setOutput(''); return; }
    const result = minifyCss(input);
    setOutput(result);
    addEntry('CSS Minifier');
  }, [input, addEntry]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">{'{ }'}</span>
        <h1 className="font-heading text-2xl font-bold text-text">CSS Minifier</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Input CSS</span>
              <span className="text-xs text-text-tertiary">{formatBytes(originalSize)}</span>
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={22}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste CSS here..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Minified Output</span>
              <div className="flex items-center gap-2">
                <button onClick={handleMinify} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Minify</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={22}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Minified CSS will appear here..." />
          </div>
        </GlassCard>
      </div>

      {output && (
        <div className="mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-text-tertiary text-xs">Original Size</span>
                  <p className="text-text font-semibold mt-1">{formatBytes(originalSize)}</p>
                </div>
                <div>
                  <span className="text-text-tertiary text-xs">Minified Size</span>
                  <p className="text-text font-semibold mt-1">{formatBytes(minifiedSize)}</p>
                </div>
                <div>
                  <span className="text-text-tertiary text-xs">Bytes Saved</span>
                  <p className="text-cat-code font-semibold mt-1">{formatBytes(bytesSaved)}</p>
                </div>
                <div>
                  <span className="text-text-tertiary text-xs">Reduction</span>
                  <p className="text-cat-code font-semibold mt-1">{percentSaved}%</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
}
