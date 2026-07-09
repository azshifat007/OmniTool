'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PdfRotatePage() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPdf = async (f) => {
    setFile(f);
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(Array.from({ length: pdf.getPageCount() }, (_, i) => ({ num: i + 1, rotation: 0 })));
  };

  const rotate = (idx) => {
    setPages((p) => p.map((pg, i) => i === idx ? { ...pg, rotation: (pg.rotation + 90) % 360 } : pg));
  };

  const degrees = (d) => d === 0 ? '0°' : d === 90 ? '90°' : d === 180 ? '180°' : '270°';

  const apply = async () => {
    setLoading(true);
    const { degrees } = await import('pdf-lib');
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());
    for (const pg of pages) {
      if (pg.rotation !== 0) {
        const page = src.getPage(pg.num - 1);
        page.setRotation(degrees(page.getRotation().angle + pg.rotation));
      }
    }
    const blob = new Blob([await src.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.name.replace('.pdf', '-rotated.pdf'); a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Rotate PDF</h1>
        <p className="text-text-secondary">Rotate individual pages in a PDF</p>
      </motion.div>

      {!file && (
        <div onClick={() => document.getElementById('pdf-input').click()} className="bg-surface rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-14 text-center cursor-pointer">
          <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && loadPdf(e.target.files[0])} className="hidden" />
          <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
          <p className="text-text font-medium mb-1">Select a PDF file</p>
        </div>
      )}

      {file && pages.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-text-secondary">{file.name} &middot; {pages.length} pages</div>
            <button onClick={() => { setFile(null); setPages([]); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
            {pages.map((pg, i) => (
              <button key={i} onClick={() => rotate(i)}
                className="aspect-[3/4] rounded-xl border-2 border-border bg-surface flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-all cursor-pointer"
              >
                <span className="text-lg font-mono font-bold text-text">{pg.num}</span>
                <span className="text-[10px] font-mono text-text-tertiary">{degrees(pg.rotation)}</span>
              </button>
            ))}
          </div>

          <button onClick={apply} disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
            {loading ? 'Saving...' : 'Download Rotated PDF'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
