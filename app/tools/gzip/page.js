'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

async function compress(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  const blob = await new Response(cs.readable).blob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function decompress(uint8) {
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(uint8);
  writer.close();
  const blob = await new Response(ds.readable).blob();
  return new TextDecoder().decode(await blob.arrayBuffer());
}

function toHex(uint8) {
  return Array.from(uint8).map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

function uint8ToStr(uint8) {
  let s = '';
  for (let i = 0; i < uint8.length; i++) {
    const b = uint8[i];
    s += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
  }
  return s;
}

const samples = [
  ['Short', 'Hello, World! This is a test.'],
  ['JSON', '{"name":"OmniTool","type":"app","version":"1.0","features":["tools","converters","generators"]}'],
  ['Repeated', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
];

export default function GzipPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [compressed, setCompressed] = useState(null);
  const [decompressed, setDecompressed] = useState(null);
  const [hexView, setHexView] = useState('');
  const [mode, setMode] = useState('compress');

  const handleCompress = async () => {
    if (!input.trim()) return;
    const uint8 = await compress(input);
    setCompressed(uint8);
    setDecompressed(null);
    setHexView(toHex(uint8));
    addEntry('GZip Compressor');
  };

  const handleDecompress = async () => {
    if (!input.trim()) return;
    try {
      const bytes = input.replace(/\s/g, '');
      const uint8 = new Uint8Array(bytes.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
      const text = await decompress(uint8);
      setDecompressed(text);
      setCompressed(null);
      setHexView('');
      addEntry('GZip Compressor');
    } catch (e) {
      setDecompressed('(error: invalid compressed data)');
    }
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const ratio = compressed ? ((compressed.length / inputBytes) * 100).toFixed(1) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⊡</span>
        <h1 className="font-heading text-2xl font-bold text-text">GZip Compressor</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setMode('compress')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'compress' ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>Compress</button>
              <button onClick={() => setMode('decompress')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${mode === 'decompress' ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>Decompress</button>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-2 block">
                {mode === 'compress' ? 'Text to Compress' : 'Hex Data to Decompress'}
              </label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6}
                placeholder={mode === 'compress' ? 'Enter text to gzip compress...' : 'Enter hex bytes (e.g. 1f 8b 08...)'}
                className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <button onClick={mode === 'compress' ? handleCompress : handleDecompress}
              className="w-full rounded-xl px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              {mode === 'compress' ? 'Compress' : 'Decompress'}
            </button>

            <div className="flex flex-wrap gap-2">
              {samples.map(([name, text]) => (
                <button key={name} onClick={() => setInput(text)}
                  className="text-[10px] px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{name}</button>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          {compressed && (
            <GlassCard>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">Compressed</span>
                  <CopyButton text={hexView} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">Original</div>
                    <div className="text-lg font-mono font-bold text-text">{inputBytes} B</div>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border text-center">
                    <div className="text-[10px] text-text-tertiary mb-1">Compressed</div>
                    <div className="text-lg font-mono font-bold text-text">{compressed.length} B</div>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                  <div className="h-full rounded-full bg-cat-success transition-all" style={{ width: `${Math.min(100, parseFloat(ratio))}%` }} />
                </div>
                <div className="text-[10px] text-text-secondary text-center">{ratio}% of original ({(100 - parseFloat(ratio)).toFixed(1)}% saved)</div>
                <div>
                  <span className="text-[10px] text-text-tertiary mb-1 block">Hex</span>
                  <pre className="bg-surface rounded-lg p-2 text-[10px] font-mono text-text-secondary border border-border whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{hexView}</pre>
                </div>
              </div>
            </GlassCard>
          )}

          {decompressed && (
            <GlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">Decompressed</span>
                  <CopyButton text={decompressed} />
                </div>
                <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{decompressed}</pre>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
}
