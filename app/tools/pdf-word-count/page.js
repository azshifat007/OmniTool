'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfWordCountPage() {
  const { addEntry } = useHistory();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setStats(null);
    addEntry('PDF Word Count');
    if (file.type !== 'application/pdf') { setError('Not a PDF file.'); return; }
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs';
      const pdf = await getDocument({ data: buf }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n';
      }
      const words = fullText.match(/\b\w+\b/g) || [];
      const chars = fullText.length;
      const charsNoSpace = fullText.replace(/\s/g, '').length;
      const lines = fullText.split('\n').filter(l => l.trim());
      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim());
      setStats({
        pages: pdf.numPages,
        words: words.length,
        chars,
        charsNoSpace,
        lines: lines.length,
        sentences: sentences.length,
        avgWordLen: words.length ? (charsNoSpace / words.length).toFixed(1) : 0,
        sizeKB: Math.round(file.size / 1024),
      });
    } catch (e) {
      setError('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">Wc</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Word Count</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Count words, characters, sentences and pages in a PDF document.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm text-text-secondary">{loading ? 'Processing...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="text-center text-4xl font-bold font-heading text-text py-2">{stats.words.toLocaleString()} <span className="text-lg text-text-secondary font-normal">words</span></div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Pages', stats.pages],
                  ['Characters', stats.chars.toLocaleString()],
                  ['Chars (no space)', stats.charsNoSpace.toLocaleString()],
                  ['Sentences', stats.sentences.toLocaleString()],
                  ['Lines', stats.lines.toLocaleString()],
                  ['Avg Word Length', stats.avgWordLen + ' chars'],
                  ['File Size', stats.sizeKB + ' KB'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                    <span className="text-text-tertiary">{label}</span>
                    <span className="font-mono text-text">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
