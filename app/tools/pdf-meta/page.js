'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfMetaPage() {
  const { addEntry } = useHistory();
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    setError('');
    setMeta(null);
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setError('Please select a PDF file.'); return; }
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.1.200/pdf.worker.min.mjs';
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const info = doc._pdfInfo || {};
      const metaData = await doc.getMetadata().catch(() => ({}));
      setMeta({
        pages: doc.numPages,
        title: metaData.info?.Title || '(none)',
        author: metaData.info?.Author || '(none)',
        subject: metaData.info?.Subject || '(none)',
        keywords: metaData.info?.Keywords || '(none)',
        creator: metaData.info?.Creator || '(none)',
        producer: metaData.info?.Producer || '(none)',
        created: metaData.info?.CreationDate || '(none)',
        modified: metaData.info?.ModDate || '(none)',
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
      addEntry('PDF Meta Reader');
    } catch (e) {
      setError('Could not read PDF metadata: ' + e.message);
    }
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">PDF</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Meta Reader</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <p className="text-sm text-text-secondary text-center">Upload a PDF to read its metadata and document info.</p>
          <div className="flex justify-center">
            <label className="px-5 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer inline-block">
              Upload PDF
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" />
            </label>
          </div>
          {fileName && <div className="text-xs text-text-tertiary text-center">{fileName}</div>}
          {meta && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <div className="flex items-center justify-end">
                <CopyButton
                  text={[
                    `Pages: ${meta.pages}`,
                    `Title: ${meta.title}`,
                    `Author: ${meta.author}`,
                    `Subject: ${meta.subject}`,
                    `Keywords: ${meta.keywords}`,
                    `Creator: ${meta.creator}`,
                    `Producer: ${meta.producer}`,
                    `Created: ${meta.created}`,
                    `Modified: ${meta.modified}`,
                    `File Size: ${meta.size}`,
                  ].join('\n')}
                  className="text-xs"
                />
              </div>
              {[
                { label: 'Pages', value: meta.pages },
                { label: 'Title', value: meta.title },
                { label: 'Author', value: meta.author },
                { label: 'Subject', value: meta.subject },
                { label: 'Keywords', value: meta.keywords },
                { label: 'Creator', value: meta.creator },
                { label: 'Producer', value: meta.producer },
                { label: 'Created', value: meta.created },
                { label: 'Modified', value: meta.modified },
                { label: 'File Size', value: meta.size },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <span className="text-text-tertiary">{r.label}</span>
                  <span className="font-mono text-text text-xs max-w-[200px] truncate text-right">{r.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
