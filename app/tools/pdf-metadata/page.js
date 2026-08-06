'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfMetadataPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const loadPdf = async (f) => {
    setFile(f);
    setDone(false);
    addEntry('PDF Metadata Editor');
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs';
      const buf = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const m = await doc.getMetadata().catch(() => ({}));
      const info = m.info || {};
      setMeta({
        title: info.Title || '',
        author: info.Author || '',
        subject: info.Subject || '',
        keywords: info.Keywords || '',
        creator: info.Creator || '',
        producer: info.Producer || '',
      });
    } catch {
      setMeta({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '' });
    }
  };

  const set = (k, v) => setMeta((m) => ({ ...m, [k]: v }));

  const apply = async () => {
    setLoading(true);
    addEntry('PDF Metadata Editor');
    const { PDFDocument } = await import('pdf-lib');
    const src = await PDFDocument.load(await file.arrayBuffer());
    if (meta.title) src.setTitle(meta.title);
    if (meta.author) src.setAuthor(meta.author);
    if (meta.subject) src.setSubject(meta.subject);
    if (meta.keywords) src.setKeywords(meta.keywords);
    if (meta.creator) src.setCreator(meta.creator);
    if (meta.producer) src.setProducer(meta.producer);
    const blob = new Blob([await src.save()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, '') + '-metadata.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
    setDone(true);
  };

  const summary = Object.entries(meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');

  const fields = [
    ['title', 'Title'],
    ['author', 'Author'],
    ['subject', 'Subject'],
    ['keywords', 'Keywords'],
    ['creator', 'Creator'],
    ['producer', 'Producer'],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">✎</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Metadata Editor</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Read and edit the document information of a PDF.</p>
          {!file && (
            <div onClick={() => document.getElementById('pdf-input').click()} className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl">
              <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && loadPdf(e.target.files[0])} className="hidden" />
              <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
              <p className="text-text font-medium mb-1">Select a PDF file</p>
              <p className="text-text-secondary text-sm">Click to browse</p>
            </div>
          )}

          {file && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-text-secondary">{file.name}</div>
                <button onClick={() => { setFile(null); setDone(false); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
              </div>

              <div className="space-y-3">
                {fields.map(([k, label]) => (
                  <div key={k}>
                    <label className="text-xs text-text-tertiary block mb-1">{label}</label>
                    <input value={meta[k]} onChange={(e) => set(k, e.target.value)}
                      className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
                  </div>
                ))}
              </div>

              {summary && (
                <div className="flex items-center justify-end">
                  <CopyButton text={summary} className="text-xs" />
                </div>
              )}

              <button onClick={apply} disabled={loading}
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Saving...' : 'Download Edited PDF'}
              </button>

              {done && <p className="text-sm text-cat-code text-center">Downloaded successfully</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
