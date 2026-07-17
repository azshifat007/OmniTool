'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfCompressPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = useCallback(async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setLoading(true);
    addEntry('PDF Compress');
    setInfo({
      name: f.name,
      size: f.size,
      sizeKB: (f.size / 1024).toFixed(1),
      pages: 0,
    });
    try {
      const buf = await f.arrayBuffer();
      const pdfLib = await import('pdf-lib');
      const pdf = await pdfLib.PDFDocument.load(buf);
      setInfo(prev => ({ ...prev, pages: pdf.getPageCount() }));
    } catch {
      // ignore
    }
    setLoading(false);
  }, [addEntry]);

  const compress = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    addEntry('PDF Compress');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const bytes = await pdf.save({ useObjectStreams: true, objectsPerTick: 50 });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
      a.click();
      URL.revokeObjectURL(url);
      const saved = bytes.length;
      const pct = info ? Math.max(0, Math.round((1 - saved / info.size) * 100)) : 0;
      setResult({ saved, pct });
    } catch {
      // ignore
    }
    setLoading(false);
  }, [file, info, addEntry]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⊟</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Compress</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Upload PDF</label>
          <input type="file" accept=".pdf" onChange={handleFile}
            className="w-full text-sm text-text file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer file:cursor-pointer" />
          {loading && <div className="text-sm text-text-secondary animate-pulse mt-3">Working...</div>}
        </div>
      </GlassCard>

      {info && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text truncate">{info.name}</div>
                  <div className="text-xs text-text-tertiary mt-1">Filename</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{formatSize(info.size)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Original Size</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{info.pages}</div>
                  <div className="text-xs text-text-tertiary mt-1">Pages</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">
                    {info.pages > 0 ? formatSize(info.size / info.pages) : '—'}
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">Per Page</div>
                </div>
              </div>
              <button onClick={compress} disabled={loading}
                className="mt-4 w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                Compress & Download
              </button>
            </div>
          </GlassCard>
          {result && (
            <GlassCard>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-surface rounded-xl border border-border">
                    <div className="text-lg font-bold font-heading text-cat-code">{formatSize(result.saved)}</div>
                    <div className="text-xs text-text-tertiary mt-1">Compressed Size</div>
                  </div>
                  <div className="text-center p-3 bg-surface rounded-xl border border-border">
                    <div className="text-lg font-bold font-heading text-cat-code">{result.pct}%</div>
                    <div className="text-xs text-text-tertiary mt-1">Saved</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
          <GlassCard>
            <div className="p-4">
              <div className="text-xs text-text-tertiary mb-3">Compression Tips</div>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-center gap-2">• Remove unused fonts and images from your source PDF</li>
                <li className="flex items-center gap-2">• Downsample high-resolution images before embedding</li>
                <li className="flex items-center gap-2">• Use grayscale instead of RGB for non-color documents</li>
                <li className="flex items-center gap-2">• Remove metadata, annotations, and form fields</li>
                <li className="flex items-center gap-2">• Try converting to PDF/A which often reduces file size</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
