'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfRemovePage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resultSize, setResultSize] = useState(0);

  const loadPdf = async (f) => {
    setFile(f); setSelected([]); setDone(false);
    addEntry('PDF Remove Pages');
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(pdf.getPageCount());
  };

  const toggle = (n) => {
    setSelected((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  };

  const remove = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    addEntry('PDF Remove Pages');
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());
    const keep = Array.from({ length: pages }, (_, i) => i).filter((i) => !selected.includes(i + 1));
    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(src, keep);
    copied.forEach((p) => doc.addPage(p));
    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    setResultSize(bytes.length);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.name.replace(/\.pdf$/i, '') + '-cleaned.pdf'; a.click();
    URL.revokeObjectURL(url);
    setLoading(false); setDone(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">✂</span>
        <h1 className="font-heading text-2xl font-bold text-text">Remove Pages</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Delete unwanted pages from a PDF.</p>
          {!file && (
            <div onClick={() => document.getElementById('pdf-input').click()} className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl">
              <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && loadPdf(e.target.files[0])} className="hidden" />
              <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
              <p className="text-text font-medium mb-1">Select a PDF file</p>
              <p className="text-text-secondary text-sm">Click to browse</p>
            </div>
          )}

          {file && pages > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">{file.name} &middot; {pages} pages</div>
                <button onClick={() => { setFile(null); setPages(0); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
              </div>

              <p className="text-xs text-text-tertiary">Click pages to remove (will be deleted)</p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => toggle(n)}
                    className={`aspect-[3/4] rounded-xl border-2 flex items-center justify-center text-sm font-mono font-semibold transition-all cursor-pointer ${
                      selected.includes(n)
                        ? 'border-cat-text bg-cat-text/10 text-cat-text line-through'
                        : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
                    }`}
                  >{n}</button>
                ))}
              </div>

              <button onClick={remove} disabled={selected.length === 0 || loading}
                className="w-full px-6 py-2.5 rounded-xl bg-cat-text text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                {loading ? 'Processing...' : `Remove ${selected.length} page${selected.length !== 1 ? 's' : ''}`}
              </button>

              {done && <p className="text-sm text-cat-code text-center">Downloaded cleaned PDF ({(resultSize / 1024).toFixed(1)} KB)</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
