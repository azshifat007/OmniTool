'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function makeTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
}

const TABLE = makeTable();

function crc32Bytes(bytes) {
  let crc = 0xFFFFFFFF;
  for (const byte of bytes) crc = TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
}

function crc32(text) {
  if (!text) return '';
  return crc32Bytes(new TextEncoder().encode(text));
}

export default function Crc32Page() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('Hello, World!');
  const [fileName, setFileName] = useState('');
  const [byteLength, setByteLength] = useState(null);
  const fileRef = useRef(null);

  const hash = crc32(input);

  const handleInput = useCallback((e) => {
    setInput(e.target.value);
    setFileName('');
    setByteLength(null);
    addEntry('CRC32 Checksum');
  }, [addEntry]);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      setFileName(file.name);
      setByteLength(bytes.length);
      setInput(new TextDecoder().decode(bytes));
      addEntry('CRC32 Checksum');
    };
    reader.readAsArrayBuffer(file);
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">CRC32 Checksum</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Calculate the CRC32 checksum of text or a file. Useful for data integrity checks.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Input</label>
            <textarea value={input} onChange={handleInput} rows={4}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">Or load a file:</span>
            <button onClick={() => fileRef.current?.click()}
              className="text-xs font-medium rounded-lg bg-surface border border-border px-3 py-1.5 text-text-secondary hover:text-text transition-colors cursor-pointer">
              Choose file
            </button>
            <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
          </div>
          <div className="bg-surface rounded-xl p-4 border border-border/50">
            <div className="text-xs text-text-tertiary mb-1">CRC32</div>
            <div className="text-xl font-mono font-bold text-text tracking-wider">{hash || '—'}</div>
          </div>
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>{fileName ? `File: ${fileName}` : 'Text input'}</span>
            <span>{byteLength !== null ? `${byteLength} bytes` : `${new TextEncoder().encode(input).length} chars`}</span>
          </div>
          <div className="flex justify-center"><CopyButton text={hash} className="text-xs" /></div>
          <div className="text-xs text-text-tertiary text-center">Auto-updates as you type</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
