'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
    h1 { color: #2563eb; }
    .card { background: #f1f5f9; border-radius: 12px; padding: 1.5rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a sample HTML preview.</p>
  <div class="card">
    <p>You can edit the HTML in the editor tab and see the result here.</p>
  </div>
</body>
</html>`;

export default function HtmlPreviewPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_HTML);
  const [tab, setTab] = useState('editor');
  const iframeRef = useRef(null);

  const charCount = input.length;
  const lineCount = input ? input.split('\n').length : 0;

  const handleRender = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(input);
    }
    addEntry('HTML Preview');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">&lt;/&gt;</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTML Preview</h1>
      </div>

      <GlassCard>
        <div className="p-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {['editor', 'preview', 'split'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  tab === t ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}
              >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-text-tertiary">{charCount} chars / {lineCount} lines</span>
            {tab !== 'preview' && <CopyButton text={input} />}
            <button onClick={handleRender} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Render</button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-5">
        {(tab === 'editor' || tab === 'split') && (
          <div className={tab === 'split' ? 'w-1/2 float-left pr-2' : 'w-full'}>
            <GlassCard>
              <div className="p-4">
                <label className="text-xs text-text-tertiary mb-3 block">HTML Source</label>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={20}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Paste HTML here..." />
              </div>
            </GlassCard>
          </div>
        )}
        {(tab === 'preview' || tab === 'split') && (
          <div className={tab === 'split' ? 'w-1/2 float-left pl-2' : 'w-full'}>
            <GlassCard>
              <div className="p-4">
                <label className="text-xs text-text-tertiary mb-3 block">Preview</label>
                <iframe ref={iframeRef} title="preview"
                  className="w-full h-[520px] bg-white rounded-lg border border-border"
                  srcDoc={input} sandbox="allow-scripts" />
              </div>
            </GlassCard>
          </div>
        )}
        <div style={{ clear: 'both' }} />
      </div>
    </motion.div>
  );
}
