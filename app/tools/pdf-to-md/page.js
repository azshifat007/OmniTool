'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfToMdPage() {
  const { addEntry } = useHistory();
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const extract = useCallback(async (file) => {
    setLoading(true);
    setError('');
    setMarkdown('');
    setFileName(file.name);
    addEntry('PDF to Markdown');
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);

      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        text += `## Page ${i}\n\n${pageText}\n\n`;
      }
      setMarkdown(text.trim());
    } catch (e) {
      setError('Failed to extract text: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') extract(file);
    else setError('Please drop a valid PDF file.');
  };

  const downloadMd = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, '') + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">MD</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF to Markdown</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Extract text from PDF files as clean Markdown.</p>
          {!markdown && !loading && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl"
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files[0] && extract(e.target.files[0])}
                className="hidden"
              />
              <div className="text-4xl mb-4 text-text-tertiary">⊞</div>
              <p className="text-text font-medium mb-1">Drop a PDF file here</p>
              <p className="text-text-secondary text-sm">or click to browse</p>
            </div>
          )}

          {loading && (
            <div className="border border-border p-10 text-center rounded-xl">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Extracting text...</p>
            </div>
          )}

          {error && (
            <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
              {error}
            </div>
          )}

          {markdown && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  {fileName} &middot; {pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {markdown.length.toLocaleString()} chars
                </div>
                <div className="flex gap-2">
                  <CopyButton text={markdown} />
                  <button onClick={downloadMd}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all cursor-pointer">
                    Download .md
                  </button>
                </div>
              </div>
              <div className="bg-bg rounded-xl border border-border p-4">
                <textarea
                  value={markdown}
                  readOnly
                  className="w-full h-96 bg-transparent rounded-xl p-4 text-sm font-mono text-text resize-none outline-none leading-relaxed"
                />
              </div>
              <button onClick={() => { setMarkdown(''); setFileName(''); setPageCount(0); }}
                className="text-sm text-text-secondary hover:text-text transition-colors cursor-pointer">
                &larr; Convert another PDF
              </button>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
