'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfThumbnailPage() {
  const { addEntry } = useHistory();
  const [thumbnails, setThumbnails] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setThumbnails([]);
    addEntry('PDF Thumbnail');
    if (file.type !== 'application/pdf') { setError('Not a PDF file.'); return; }
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs';
      const pdf = await getDocument({ data: buf }).promise;
      const pages = Math.min(pdf.numPages, 10);
      const thumbs = [];
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        thumbs.push({ src: canvas.toDataURL(), page: i, width: Math.round(vp.width), height: Math.round(vp.height) });
      }
      setThumbnails(thumbs);
    } catch (e) {
      setError('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">▤</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Thumbnail</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Generate thumbnail preview images of PDF pages.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl px-6 py-6 cursor-pointer hover:border-primary transition-colors">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm text-text-secondary">{loading ? 'Processing...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {thumbnails.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {thumbnails.map(t => (
                <div key={t.page} className="bg-surface rounded-xl border border-border/50 overflow-hidden">
                  <img src={t.src} alt={`Page ${t.page}`} className="w-full" />
                  <div className="px-2 py-1.5 text-[10px] text-text-tertiary text-center border-t border-border/50">
                    Page {t.page} · {t.width}×{t.height}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
