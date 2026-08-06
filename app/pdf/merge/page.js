'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfMergePage() {
  const { addEntry } = useHistory();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [merging, setMerging] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (droppedFiles.length === 0) {
      setError('Please drop valid PDF files only.');
      return;
    }
    setError('');
    addEntry('PDF Merger');
    setFiles((prev) => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const newFiles = droppedFiles.filter(f => !existing.has(f.name + f.size));
      return [...prev, ...newFiles];
    });
  }, [addEntry]);

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const reordered = [...files];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    setFiles(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files.');
      return;
    }
    setMerging(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-output.pdf';
      a.click();
      URL.revokeObjectURL(url);
      addEntry('PDF Merger');
    } catch (err) {
      setError('Failed to merge PDFs: ' + (err.message || 'Unknown error. File may be corrupted.'));
    } finally {
      setMerging(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Merger</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="p-8 border-2 border-dashed border-border rounded-2xl text-center hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="text-3xl mb-2 opacity-50">⊞</div>
              <p className="text-text-tertiary text-sm">Drop PDF files here</p>
              <p className="text-text-secondary text-xs mt-1">or click to select</p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files).filter(f =>
                    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
                  );
                  if (selected.length > 0) {
                    setError('');
                    addEntry('PDF Merger');
                    setFiles((prev) => {
                      const existing = new Set(prev.map(f => f.name + f.size));
                      const newFiles = selected.filter(f => !existing.has(f.name + f.size));
                      return [...prev, ...newFiles];
                    });
                  }
                }}
                className="hidden"
                id="pdf-input"
              />
              <label htmlFor="pdf-input" className="cursor-pointer">
                <span className="text-xs text-primary hover:text-primary-light transition-colors mt-2 inline-block">Browse files</span>
              </label>
            </div>
          </GlassCard>

          {error && (
            <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
              {error}
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={merging || files.length < 2}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {merging ? 'Merging...' : `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Files ({files.length})</span>
              {files.length > 0 && (
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-text-tertiary hover:text-cat-text transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            {files.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8">No files added yet</div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence>
                  {files.map((file, i) => (
                    <motion.div
                      key={file.name + file.size}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragEnter={() => handleDragEnter(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className="bg-surface rounded-lg px-3 py-2 flex items-center gap-3 cursor-grab active:cursor-grabbing border border-border/50"
                    >
                      <span className="text-text-tertiary text-xs">☰</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text truncate">{file.name}</p>
                        <p className="text-xs text-text-secondary">{formatSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-text-tertiary hover:text-cat-text transition-colors text-sm cursor-pointer"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
