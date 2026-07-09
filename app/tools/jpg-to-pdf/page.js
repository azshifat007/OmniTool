'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function JpgToPdfPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imgs]);
    setDone(false);
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
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    for (const f of files) {
      const imgBytes = await f.arrayBuffer();
      const ext = f.type === 'image/png' ? 'png' : f.type === 'image/jpeg' || f.type === 'image/jpg' ? 'jpg' : null;
      if (!ext) continue;
      const img = ext === 'png' ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const blob = new Blob([await doc.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'images-converted.pdf'; a.click();
    URL.revokeObjectURL(url);
    setLoading(false); setDone(true);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">JPG to PDF</h1>
        <p className="text-text-secondary">Convert images into a PDF document</p>
      </motion.div>

      <div onClick={() => inputRef.current?.click()} className="bg-surface rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer mb-5">
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
        <p className="text-text font-medium mb-1">Add images</p>
        <p className="text-text-secondary text-sm">JPG, PNG, WebP &middot; Drag or click</p>
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
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
            {loading ? 'Creating PDF...' : `Convert to PDF`}
          </button>
          {done && <p className="text-sm text-cat-code">PDF downloaded</p>}
        </motion.div>
      )}
    </div>
  );
}
