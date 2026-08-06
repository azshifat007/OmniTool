'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfToTxtPage() {
  const { addEntry } = useHistory();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const downloadTxt = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setText('');
    addEntry('PDF to TXT');
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⇩</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF to TXT</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Extract plain text from PDF documents.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm text-text-secondary">{loading ? 'Extracting...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {text && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Extracted Text ({text.length} chars)</span>
                <div className="flex gap-2">
                  <CopyButton text={text} className="text-xs" />
                  <button onClick={downloadTxt}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-bg border border-border text-text-secondary hover:text-text hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    Download
                  </button>
                </div>
              </div>
              <pre className="bg-surface rounded-xl p-4 text-sm text-text leading-relaxed border border-border/50 max-h-96 overflow-y-auto whitespace-pre-wrap">{text}</pre>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
