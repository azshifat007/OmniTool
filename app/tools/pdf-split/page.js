'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfSplitPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [range, setRange] = useState('');
  const inputRef = useRef(null);

  const loadPdf = async (f) => {
    setFile(f);
    setSelected([]);
    setDone(false);
    setRange('');
    addEntry('PDF Split');
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1));
  };

  const toggle = (n) => {
    setSelected((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  };

  const applyRange = () => {
    const out = new Set();
    range.split(',').forEach((part) => {
      const t = part.trim();
      if (!t) return;
      if (t.includes('-')) {
        const [a, b] = t.split('-').map((x) => parseInt(x, 10));
        if (a && b) for (let i = a; i <= b; i++) out.add(i);
      } else {
        const n = parseInt(t, 10);
        if (n) out.add(n);
      }
    });
    setSelected(Array.from(out).filter((n) => n >= 1 && n <= pages.length).sort((a, b) => a - b));
  };

  const split = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    addEntry('PDF Split');
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());

    if (selected.length === 1) {
      const p = selected[0];
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [p - 1]);
      doc.addPage(page);
      downloadBlob(new Blob([await doc.save()], { type: 'application/pdf' }), `page-${p}.pdf`);
    } else {
      for (const n of selected) {
        const doc = await PDFDocument.create();
        const [page] = await doc.copyPages(src, [n - 1]);
        doc.addPage(page);
        downloadBlob(new Blob([await doc.save()], { type: 'application/pdf' }), `page-${n}.pdf`);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⊟</span>
        <h1 className="font-heading text-2xl font-bold text-text">Split PDF</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Extract pages into separate PDF files.</p>
          {!file && (
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl">
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
                <button onClick={() => { setFile(null); setPages([]); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
              </div>

              <div className="flex gap-2">
                <input value={range} onChange={(e) => setRange(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={applyRange}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text hover:border-primary transition-all cursor-pointer">
                  Apply
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">All</button>
                <button onClick={clearSel} className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer">None</button>
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
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                {loading ? 'Extracting...' : `Extract ${selected.length} page${selected.length !== 1 ? 's' : ''}`}
              </button>

              {done && <p className="text-sm text-cat-code text-center">Downloaded {selected.length} file{selected.length !== 1 ? 's' : ''}</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
