'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';

export default function ImageB64Page() {
  const [dataUrl, setDataUrl] = useState('');
  const [base64, setBase64] = useState('');
  const [mime, setMime] = useState('');
  const [name, setName] = useState('');
  const [size, setSize] = useState(0);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setName(file.name);
    setSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setDataUrl(result);
      const comma = result.indexOf(',');
      setMime(result.slice(5, comma).split(';')[0]);
      setBase64(result.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handlePaste = async () => {
    const clipboard = await navigator.clipboard.read();
    for (const item of clipboard) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          handleFile(new File([blob], 'pasted-image', { type: blob.type }));
          return;
        }
      }
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text mb-2">Image to Base64</h1>
        <p className="text-text-secondary">Convert images to Base64-encoded data URIs</p>
      </motion.div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="bg-surface rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-10 text-center cursor-pointer mb-6"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />
        <div className="text-3xl mb-3">🖼️</div>
        <p className="text-text-secondary text-sm mb-1">Drop an image here, click to browse, or</p>
        <button onClick={(e) => { e.stopPropagation(); handlePaste(); }} className="text-primary text-sm font-semibold hover:underline cursor-pointer">
          paste from clipboard
        </button>
      </div>

      {dataUrl && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-surface rounded-2xl border border-border p-4">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3 block">Preview</label>
              <img src={dataUrl} alt="Preview" className="max-w-full max-h-64 rounded-xl object-contain bg-bg" />
              <div className="mt-3 text-xs text-text-secondary space-y-1">
                <p>File: {name}</p>
                <p>Size: {(size / 1024).toFixed(1)} KB</p>
                <p>Type: {mime}</p>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Base64</label>
                <CopyButton text={base64} />
              </div>
              <div className="w-full h-64 overflow-auto bg-bg rounded-xl p-3">
                <code className="text-xs text-text break-all whitespace-pre-wrap font-mono">{base64}</code>
              </div>
              <div className="mt-2 text-xs text-text-tertiary">{base64.length.toLocaleString()} characters</div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">Data URI (ready to use)</label>
              <CopyButton text={dataUrl} />
            </div>
            <div className="w-full max-h-20 overflow-auto bg-bg rounded-xl p-3">
              <code className="text-xs text-text break-all whitespace-pre-wrap font-mono">{dataUrl}</code>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
