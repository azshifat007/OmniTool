'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfToImagePage() {
  const { addEntry } = useHistory();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    addEntry('PDF to Image');
    try {
      const buf = await file.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      const imgs = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        imgs.push({ src: canvas.toDataURL('image/png'), width: vp.width, height: vp.height, page: i });
      }
      setPages(imgs);
    } catch (err) {
      setPages([]);
    }
    setLoading(false);
  }, [scale, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">▤</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF to Image</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex-1">
              <span className="text-xs text-text-tertiary block mb-2">Select PDF</span>
              <input type="file" accept=".pdf" onChange={handleFile}
                className="w-full text-sm text-text file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer file:cursor-pointer" />
            </label>
            <div className="w-24">
              <span className="text-xs text-text-tertiary block mb-2">Scale</span>
              <select value={scale} onChange={e => setScale(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
              </select>
            </div>
          </div>
          {loading && <div className="text-sm text-text-secondary animate-pulse">Converting pages...</div>}
        </div>
      </GlassCard>

      {pages.length > 0 && (
        <div className="mt-5 space-y-4">
          {pages.map(p => (
            <GlassCard key={p.page}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-tertiary">Page {p.page} · {p.width}×{p.height}px</span>
                  <a href={p.src} download={`page-${p.page}.png`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors no-underline cursor-pointer">
                    Download
                  </a>
                </div>
                <img src={p.src} alt={`Page ${p.page}`} className="w-full rounded-lg border border-border" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
