'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function UrlExtractorPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Visit https://example.com and http://test.com/path?q=1 for more info. Email us at hello@example.com.');
  const [urls, setUrls] = useState([]);

  const extract = useCallback(() => {
    addEntry('URL Extractor');
    const pattern = /https?:\/\/[^\s<>"']+|(?:www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s<>"']*)?/gi;
    const found = input.match(pattern) || [];
    const unique = [...new Set(found)];
    setUrls(unique);
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⇉</span>
        <h1 className="font-heading text-2xl font-bold text-text">URL Extractor</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Text</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <button onClick={extract} className="mt-3 px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Extract URLs</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Found ({urls.length})</span>
              {urls.length > 0 && <CopyButton text={urls.join('\n')} className="text-xs" />}
            </div>
            {urls.length === 0 ? (
              <div className="text-text-tertiary text-sm">Click Extract to find URLs.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {urls.map((url, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 px-3 rounded-lg bg-surface border border-border/50">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs font-mono text-primary hover:underline truncate">{url}</a>
                    <CopyButton text={url} className="text-[10px] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
