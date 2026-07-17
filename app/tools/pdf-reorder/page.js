'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfReorderPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const loadPdf = async (f) => {
    setFile(f);
    addEntry('PDF Reorder');
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1));
  };

  const move = (from, to) => {
    if (to < 0 || to >= pages.length) return;
    setPages((p) => {
      const next = [...p];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    move(dragIdx, idx);
    setDragIdx(null);
  };

  const apply = async () => {
    setLoading(true);
    addEntry('PDF Reorder');
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());
    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(src, pages.map((n) => n - 1));
    copied.forEach((p) => doc.addPage(p));
    const blob = new Blob([await doc.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, '') + '-reordered.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⇅</span>
        <h1 className="font-heading text-2xl font-bold text-text">Reorder PDF</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Drag pages to rearrange their order, then export.</p>
          {!file && (
            <div onClick={() => document.getElementById('pdf-input').click()} className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl">
              <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && loadPdf(e.target.files[0])} className="hidden" />
              <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
              <p className="text-text font-medium mb-1">Select a PDF file</p>
              <p className="text-text-secondary text-sm">Click to browse</p>
            </div>
          )}

          {file && pages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">{file.name} &middot; {pages.length} pages</div>
                <button onClick={() => { setFile(null); setPages([]); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
              </div>

              <p className="text-xs text-text-tertiary">Current order — drag a page to move it:</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {pages.map((n, i) => (
                  <div key={i}
                    draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(i)}
                    className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-grab active:cursor-grabbing ${
                      dragIdx === i ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'
                    }`}
                  >
                    <span className="text-[10px] text-text-tertiary">#{i + 1}</span>
                    <span className="text-base font-mono font-bold text-text">{n}</span>
                  </div>
                ))}
              </div>

              <button onClick={apply} disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Saving...' : 'Download Reordered PDF'}
              </button>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
