'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function beautifyJS(code) {
  let indent = 0;
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    const dedent = trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')');
    if (dedent && indent > 0) indent--;
    out.push('  '.repeat(indent) + trimmed);
    const open = (trimmed.match(/[{[(]/g) || []).length;
    const close = (trimmed.match(/[}\])]/g) || []).length;
    indent += open - close;
    if (indent < 0) indent = 0;
  }
  return out.join('\n');
}

function beautifyHTML(html) {
  let indent = 0;
  const out = [];
  const tokens = html.replace(/>\s*</g, '>\n<').split('\n');
  for (let raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    if (t.startsWith('</')) indent--;
    out.push('  '.repeat(Math.max(0, indent)) + t);
    if (t.startsWith('<') && !t.startsWith('</') && !t.endsWith('/>') && !t.includes('</')) indent++;
    if (indent < 0) indent = 0;
  }
  return out.join('\n');
}

function beautifyCSS(css) {
  let indent = 0;
  const out = [];
  const rules = css.replace(/}\s*/g, '}\n').split('\n').map(l => l.trim()).filter(Boolean);
  for (const raw of rules) {
    const t = raw.trim();
    if (t.startsWith('}')) indent--;
    out.push('  '.repeat(Math.max(0, indent)) + t);
    if (t.includes('{')) indent++;
    if (indent < 0) indent = 0;
  }
  return out.join('\n');
}

function beautifyJSON(code) {
  return JSON.stringify(JSON.parse(code), null, 2);
}

export default function CodeBeautifierPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('js');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const handleBeautify = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      let result;
      if (mode === 'js') result = beautifyJS(input);
      else if (mode === 'html') result = beautifyHTML(input);
      else if (mode === 'json') result = beautifyJSON(input);
      else result = beautifyCSS(input);
      setOutput(result);
      addEntry('Code Beautifier');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, mode, addEntry]);

  const handleInput = useCallback((e) => {
    setInput(e.target.value);
    if (live) {
      try {
        let result;
        if (mode === 'js') result = beautifyJS(e.target.value);
        else if (mode === 'html') result = beautifyHTML(e.target.value);
        else if (mode === 'json') result = beautifyJSON(e.target.value);
        else result = beautifyCSS(e.target.value);
        setOutput(result);
        setError('');
      } catch {
        setError('Invalid syntax — fix to preview');
      }
    }
  }, [live, mode]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">{ }</span>
        <h1 className="font-heading text-2xl font-bold text-text">Code Beautifier</h1>
      </div>
      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap items-center gap-2">
            {['js', 'html', 'css', 'json'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{m.toUpperCase()}</button>
            ))}
            <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer ml-auto">
              <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} className="accent-primary rounded" />
              Live
            </label>
          </div>
        </GlassCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Input Code</label>
            <textarea value={input} onChange={handleInput} rows={14}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste messy code here..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Beautified</span>
              <div className="flex items-center gap-2">
                <button onClick={handleBeautify} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Beautify</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={14}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Beautified code will appear here..." />
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
