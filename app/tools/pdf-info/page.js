'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfInfoPage() {
  const { addEntry } = useHistory();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setInfo(null);
    addEntry('PDF Info');
    if (file.type !== 'application/pdf') { setError('Not a PDF file.'); return; }

    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs';
      const pdf = await getDocument({ data: buf }).promise;
      const meta = await pdf.getMetadata();
      const pages = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        pages.push({ width: Math.round(vp.width), height: Math.round(vp.height) });
      }
      setInfo({
        pages: pdf.numPages,
        version: (pdf.pdfInfo?.version || pdf.pdfInfo?.pdfFormatVersion || '?'),
        encrypted: pdf._pdfInfo?.encrypted ?? false,
        title: meta.info?.Title || '(none)',
        author: meta.info?.Author || '(none)',
        creator: meta.info?.Creator || '(none)',
        producer: meta.info?.Producer || '(none)',
        created: meta.info?.CreationDate || '(none)',
        modified: meta.info?.ModDate || '(none)',
        pageSizes: pages,
        sizeKB: Math.round(file.size / 1024),
      });
    } catch (e) {
      setError('Failed to read PDF: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">PDF</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Info</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Upload a PDF to view its metadata, page count, dimensions, and more.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-8 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm text-text-secondary">{loading ? 'Reading...' : 'Click to upload a PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {info && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex items-center justify-end">
                <CopyButton
                  text={[
                    `Pages: ${info.pages}`,
                    `PDF Version: ${info.version}`,
                    `File Size: ${info.sizeKB} KB`,
                    `Title: ${info.title}`,
                    `Author: ${info.author}`,
                    `Creator: ${info.creator}`,
                    `Producer: ${info.producer}`,
                    `Created: ${info.created}`,
                    `Modified: ${info.modified}`,
                    `Encrypted: ${info.encrypted}`,
                    `Page Sizes: ${info.pageSizes.map(p => `${p.width}x${p.height}`).join(', ')}`,
                  ].join('\n')}
                  className="text-xs"
                />
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Pages</span><span className="font-mono text-text">{info.pages}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">PDF Version</span><span className="font-mono text-text">{info.version}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">File Size</span><span className="font-mono text-text">{info.sizeKB} KB</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Title</span><span className="text-text text-right max-w-[60%] truncate">{info.title}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Author</span><span className="text-text text-right max-w-[60%] truncate">{info.author}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Creator</span><span className="text-text text-right max-w-[60%] truncate">{info.creator}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                <span className="text-text-tertiary">Producer</span><span className="text-text text-right max-w-[60%] truncate">{info.producer}</span>
              </div>
              {info.pageSizes.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-text-tertiary block mb-2">Page Dimensions (first {Math.min(info.pages, 10)})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {info.pageSizes.map((p, i) => (
                      <div key={i} className="bg-surface rounded-lg px-2 py-1.5 border border-border/50 text-center">
                        <div className="text-[10px] text-text-tertiary">#{i + 1}</div>
                        <div className="text-xs font-mono text-text">{p.width}×{p.height}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
