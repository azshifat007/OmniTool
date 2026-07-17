'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfTextSearchPage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setText('');
    setMatches([]);
    addEntry('PDF Text Search');
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
      setText(fullText);
    } catch (e) {
      setError('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [addEntry]);

  const search = useCallback(() => {
    addEntry('PDF Text Search');
    if (!query.trim() || !text) { setMatches([]); return; }
    const q = query.toLowerCase();
    const lines = text.split('\n');
    const results = [];
    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      let idx = lower.indexOf(q);
      while (idx !== -1) {
        results.push({ page: i + 1, index: idx, line: line.slice(Math.max(0, idx - 30), idx + q.length + 30) });
        idx = lower.indexOf(q, idx + 1);
      }
    });
    setMatches(results.slice(0, 200));
  }, [query, text, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">🔍</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Text Search</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Search for text within a PDF document.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm text-text-secondary">{loading ? 'Extracting...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {text && (
            <>
              <div className="flex gap-2">
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
                  placeholder="Search term..." className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={search} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Search</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-text-tertiary">{matches.length} match{matches.length !== 1 ? 'es' : ''} found</div>
                {matches.length > 0 && <CopyButton text={matches.map(m => `L${m.page}: ${m.line}`).join('\n')} className="text-xs" />}
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {matches.map((m, i) => (
                  <div key={i} className="text-xs font-mono bg-surface rounded-lg px-3 py-2 border border-border/50 text-text-secondary">
                    <span className="text-text-tertiary">L{m.page}:</span> …{m.line}…
                  </div>
                ))}
                {matches.length === 0 && query && <div className="text-text-tertiary text-sm text-center py-2">No matches.</div>}
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
