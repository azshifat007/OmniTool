'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function Base64Page() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('encode');
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleConvert = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const isValid = /^[A-Za-z0-9+/]*={0,2}$/.test(input.trim());
        if (!isValid) throw new Error('Invalid Base64 input: contains invalid characters');
        const decoded = decodeURIComponent(escape(atob(input.trim())));
        setOutput(decoded);
      }
      addEntry('Base64');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, mode, addEntry]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setInput(base64);
      setMode('decode');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setInput(base64);
      setMode('decode');
    };
    reader.readAsDataURL(file);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">B64</span>
        <h1 className="font-heading text-2xl font-bold text-text">Base64 Encoder / Decoder</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {['encode', 'decode'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{m.charAt(0).toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            <div className="ml-auto">
              <button onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                Upload File
              </button>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div
            className="p-4"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
          >
            <label className="text-xs text-text-tertiary mb-3 block">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            {fileInfo && (
              <div className="mb-3 text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 border border-border">
                File: {fileInfo.name} ({formatFileSize(fileInfo.size)})
              </div>
            )}
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...\n\nOr drag & drop a file here to encode it to Base64.'} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Result</span>
              <div className="flex items-center gap-2">
                <button onClick={handleConvert} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly rows={12}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Output will appear here..." />
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
