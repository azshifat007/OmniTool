'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PdfSplitPage() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const loadPdf = async (f) => {
    setFile(f);
    setSelected([]);
    setDone(false);
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1));
  };

  const toggle = (n) => {
    setSelected((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  };

  const split = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());

    if (selected.length === 1) {
      const p = selected[0];
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [p - 1]);
      doc.addPage(page);
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      downloadBlob(blob, `page-${p}.pdf`);
    } else {
      for (const n of selected) {
        const doc = await PDFDocument.create();
        const [page] = await doc.copyPages(src, [n - 1]);
        doc.addPage(page);
        const blob = new Blob([await doc.save()], { type: 'application/pdf' });
        downloadBlob(blob, `page-${n}.pdf`);
      }
    }
    setLoading(false);
    setDone(true);
  };

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const selectAll = () => setSelected(pages.map((p) => p));
  const clearSel = () => setSelected([]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Split PDF</h1>
        <p className="text-text-secondary">Extract pages into separate PDF files</p>
      </motion.div>

      {!file && (
        <div onClick={() => inputRef.current?.click()} className="bg-surface rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-14 text-center cursor-pointer">
          <input ref={inputRef} type="file" accept=".pdf" onChange={(e) => e.target.files[0] && loadPdf(e.target.files[0])} className="hidden" />
          <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
          <p className="text-text font-medium mb-1">Select a PDF file</p>
          <p className="text-text-secondary text-sm">{pages.length ? `${pages.length} pages loaded` : ''}</p>
        </div>
      )}

      {file && pages.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">{file.name} &middot; {pages.length} pages</div>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">All</button>
              <button onClick={clearSel} className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">None</button>
              <button onClick={() => { setFile(null); setPages([]); }} className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">Change</button>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {pages.map((n) => (
              <button key={n} onClick={() => toggle(n)}
                className={`aspect-[3/4] rounded-xl border-2 flex items-center justify-center text-sm font-mono font-semibold transition-all cursor-pointer ${
                  selected.includes(n)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
                }`}
              >{n}</button>
            ))}
          </div>

          <button onClick={split} disabled={selected.length === 0 || loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {loading ? 'Extracting...' : `Extract ${selected.length} page${selected.length !== 1 ? 's' : ''}`}
          </button>

          {done && <p className="text-sm text-cat-code">Downloaded {selected.length} file{selected.length !== 1 ? 's' : ''}</p>}
        </motion.div>
      )}
    </div>
  );
}
