'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function JpgToPdfPage() {
  const { addEntry } = useHistory();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [pageSize, setPageSize] = useState('fit');
  const [margin, setMargin] = useState(true);
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setFiles((prev) => [...prev, ...imgs]);
    setDone(false);
    addEntry('JPG to PDF');
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const moveUp = (i) => {
    if (i === 0) return;
    setFiles((p) => { const a = [...p]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i) => {
    if (i >= files.length - 1) return;
    setFiles((p) => { const a = [...p]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  };

  const convert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    addEntry('JPG to PDF');
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    for (const f of files) {
      const imgBytes = await f.arrayBuffer();
      const type = f.type;
      let img;
      if (type === 'image/png') img = await doc.embedPng(imgBytes);
      else if (type === 'image/webp') {
        const bitmap = await createImageBitmap(f);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width; canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        const pngBytes = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        img = await doc.embedPng(await pngBytes.arrayBuffer());
      } else {
        img = await doc.embedJpg(imgBytes);
      }
      let pageW = img.width, pageH = img.height;
      if (pageSize === 'a4') { pageW = 595.28; pageH = 841.89; }
      if (pageSize === 'letter') { pageW = 612; pageH = 792; }
      const page = doc.addPage([pageW, pageH]);
      if (pageSize === 'fit') {
        page.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
      } else {
        const pad = margin ? 28 : 0;
        const availW = pageW - pad * 2;
        const availH = pageH - pad * 2;
        const ratio = Math.min(availW / img.width, availH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        page.drawImage(img, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
      }
    }
    const blob = new Blob([await doc.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'images-converted.pdf'; a.click();
    URL.revokeObjectURL(url);
    setLoading(false); setDone(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">▤</span>
        <h1 className="font-heading text-2xl font-bold text-text">JPG to PDF</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert images into a PDF document.</p>
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl"
          >
            <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
            <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
            <p className="text-text font-medium mb-1">Add images</p>
            <p className="text-text-secondary text-sm">JPG, PNG, WebP &middot; Drag or click</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                <option value="fit">Fit image</option>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" checked={margin} onChange={(e) => setMargin(e.target.checked)} className="accent-primary w-4 h-4 cursor-pointer" />
                Center with margin
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{files.length} image{files.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="bg-surface rounded-xl border border-border p-3">
                    <div className="aspect-[4/3] rounded-lg bg-bg mb-2 flex items-center justify-center overflow-hidden">
                      <img src={URL.createObjectURL(f)} alt="" className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-xs text-text truncate">{f.name}</p>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => moveUp(i)} disabled={i === 0} className="text-xs text-text-tertiary hover:text-text disabled:opacity-30 cursor-pointer">&uarr;</button>
                      <button onClick={() => moveDown(i)} disabled={i >= files.length - 1} className="text-xs text-text-tertiary hover:text-text disabled:opacity-30 cursor-pointer">&darr;</button>
                      <button onClick={() => removeFile(i)} className="text-xs text-cat-text ml-auto cursor-pointer">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={convert} disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Creating PDF...' : `Convert to PDF`}
              </button>
              {done && <p className="text-sm text-cat-code text-center">PDF downloaded</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
