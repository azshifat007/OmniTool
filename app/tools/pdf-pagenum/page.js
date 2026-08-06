'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfPageNumPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [pos, setPos] = useState('bottom-center');
  const [start, setStart] = useState(1);
  const [fmt, setFmt] = useState('{n}');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const positions = ['bottom-center', 'bottom-right', 'bottom-left', 'top-right', 'top-center'];

  const loadPdf = async (f) => {
    setFile(f); setDone(false);
    addEntry('PDF Page Numbers');
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPages(pdf.getPageCount());
  };

  const apply = async () => {
    setLoading(true);
    addEntry('PDF Page Numbers');
    const { PDFDocument, rgb } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());
    let num = start;
    for (let i = 0; i < src.getPageCount(); i++) {
      const page = src.getPage(i);
      const { width, height } = page.getSize();
      const text = fmt.replace(/\{n\}/g, String(num));
      const size = 10;
      const margin = 24;
      let x = width / 2 - text.length * size * 0.3;
      let y = margin;
      if (pos.includes('top')) y = height - margin - size;
      if (pos.includes('right')) x = width - margin - text.length * size * 0.6;
      if (pos.includes('left')) x = margin;
      if (pos === 'bottom-center' || pos === 'top-center') x = width / 2 - text.length * size * 0.3;
      page.drawText(text, { x, y, size, color: rgb(0.3, 0.3, 0.3) });
      num++;
    }
    const blob = new Blob([await src.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
    setDone(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">Add Page Numbers</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Stamp page numbers onto every page of a PDF.</p>
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

              <div>
                <label className="text-xs text-text-tertiary block mb-2">Position</label>
                <select value={pos} onChange={(e) => setPos(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                  {positions.map((p) => <option key={p} value={p}>{p.replace('-', ' ')}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-tertiary block mb-2">Start at</label>
                  <input type="number" value={start} min={0} onChange={(e) => setStart(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary block mb-2">Format</label>
                  <input value={fmt} onChange={(e) => setFmt(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none"
                    placeholder="{n}" />
                </div>
              </div>
              <p className="text-[10px] text-text-tertiary">Use <code className="text-cat-code">{'{n}'}</code> as the page number placeholder.</p>

              <button onClick={apply} disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Stamping...' : 'Download Numbered PDF'}
              </button>

              {done && <p className="text-sm text-cat-code text-center">Downloaded successfully</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
