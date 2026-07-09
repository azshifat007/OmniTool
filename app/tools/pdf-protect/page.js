'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PdfProtectPage() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('protect');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const process = async () => {
    if (!password) { setError('Enter a password.'); return; }
    if (!file) return;
    setError(''); setLoading(true);
    const { PDFDocument } = await import('pdf-lib');

    try {
      let doc;
      if (mode === 'protect') {
        doc = await PDFDocument.load(await file.arrayBuffer());
        doc.setOwnerPassword(password);
        doc.setUserPassword(password);
        doc.setEncryptionInfo({ userPassword: password, ownerPassword: password, permissions: { printing: 'lowResolution', modifying: false, copying: false } });
      } else {
        doc = await PDFDocument.load(await file.arrayBuffer(), { password });
      }
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = mode === 'protect'
        ? file.name.replace('.pdf', '-protected.pdf')
        : file.name.replace('.pdf', '-unlocked.pdf');
      a.href = url; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(mode === 'unlock' ? 'Wrong password or file is not encrypted.' : e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">PDF Protect & Unlock</h1>
        <p className="text-text-secondary">Add or remove password protection from PDFs</p>
      </motion.div>

      <div className="flex gap-2 mb-5">
        {['protect', 'unlock'].map((m) => (
          <button key={m} onClick={() => { setMode(m); setDone(false); setError(''); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
              mode === m ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
            }`}
          >{m === 'protect' ? 'Protect PDF' : 'Unlock PDF'}</button>
        ))}
      </div>

      {!file && (
        <div onClick={() => document.getElementById('pdf-input').click()} className="bg-surface rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-14 text-center cursor-pointer mb-5">
          <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} className="hidden" />
          <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
          <p className="text-text font-medium mb-1">Select a PDF file</p>
        </div>
      )}

      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-xs text-text-secondary hover:text-text cursor-pointer">Change</button>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4">
            <label className="text-xs text-text-tertiary mb-2 block">
              {mode === 'protect' ? 'Set a password to protect this PDF' : 'Enter the PDF password to unlock'}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter password..." />
          </div>

          {error && <p className="text-sm text-cat-text">{error}</p>}

          <button onClick={process} disabled={loading || !password}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
            {loading ? 'Processing...' : mode === 'protect' ? 'Download Protected PDF' : 'Download Unlocked PDF'}
          </button>

          {done && <p className="text-sm text-cat-code">Downloaded successfully</p>}
        </motion.div>
      )}
    </div>
  );
}
