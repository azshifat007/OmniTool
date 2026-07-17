'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function PdfProtectPage() {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('protect');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [perms, setPerms] = useState({ printing: true, modifying: false, copying: false });

  const togglePerm = (key) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  const process = async () => {
    if (!password) { setError('Enter a password.'); return; }
    if (!file) return;
    setError(''); setLoading(true); setDone(false);
    addEntry(mode === 'protect' ? 'PDF Protect' : 'PDF Unlock');
    const { PDFDocument } = await import('pdf-lib');

    try {
      let doc;
      if (mode === 'protect') {
        doc = await PDFDocument.load(await file.arrayBuffer());
        doc.setEncryptionInfo({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: perms.printing ? 'highResolution' : 'none',
            modifying: perms.modifying,
            copying: perms.copying,
            annotating: perms.modifying,
          },
        });
      } else {
        doc = await PDFDocument.load(await file.arrayBuffer(), { password });
      }
      const blob = new Blob([await doc.save()], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = mode === 'protect'
        ? file.name.replace(/\.pdf$/i, '') + '-protected.pdf'
        : file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf';
      a.href = url; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      setError(mode === 'unlock' ? 'Wrong password or file is not encrypted.' : e.message);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-pdf">🔒</span>
        <h1 className="font-heading text-2xl font-bold text-text">PDF Protect &amp; Unlock</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-md mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Add or remove password protection from PDFs.</p>
          <div className="flex gap-2">
            {['protect', 'unlock'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setDone(false); setError(''); }}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/40'
                }`}
              >{m === 'protect' ? 'Protect PDF' : 'Unlock PDF'}</button>
            ))}
          </div>

          {!file && (
            <div onClick={() => document.getElementById('pdf-input').click()} className="border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer rounded-xl">
              <input id="pdf-input" type="file" accept=".pdf" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} className="hidden" />
              <div className="text-4xl mb-3 text-text-tertiary">⊞</div>
              <p className="text-text font-medium mb-1">Select a PDF file</p>
              <p className="text-text-secondary text-sm">Click to browse</p>
            </div>
          )}

          {file && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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

              {mode === 'protect' && (
                <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
                  <div className="text-xs text-text-tertiary mb-1">Permissions (after protecting)</div>
                  {[
                    ['printing', 'Allow printing'],
                    ['modifying', 'Allow editing'],
                    ['copying', 'Allow copying text'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between text-sm text-text-secondary cursor-pointer">
                      <span>{label}</span>
                      <input type="checkbox" checked={perms[key]} onChange={() => togglePerm(key)} className="accent-primary w-4 h-4 cursor-pointer" />
                    </label>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-cat-text">{error}</p>}

              <button onClick={process} disabled={loading || !password}
                className="w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Processing...' : mode === 'protect' ? 'Download Protected PDF' : 'Download Unlocked PDF'}
              </button>

              {done && <p className="text-sm text-cat-code text-center">Downloaded successfully</p>}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
