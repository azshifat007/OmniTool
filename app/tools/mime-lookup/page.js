'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const MIME_TYPES = [
  { type: 'text/html', ext: '.html', cat: 'Text', desc: 'HTML document' },
  { type: 'text/css', ext: '.css', cat: 'Text', desc: 'CSS stylesheet' },
  { type: 'text/javascript', ext: '.js', cat: 'Text', desc: 'JavaScript file' },
  { type: 'text/plain', ext: '.txt', cat: 'Text', desc: 'Plain text' },
  { type: 'text/csv', ext: '.csv', cat: 'Text', desc: 'CSV data' },
  { type: 'text/xml', ext: '.xml', cat: 'Text', desc: 'XML document' },
  { type: 'text/markdown', ext: '.md', cat: 'Text', desc: 'Markdown file' },
  { type: 'application/json', ext: '.json', cat: 'App', desc: 'JSON data' },
  { type: 'application/pdf', ext: '.pdf', cat: 'App', desc: 'PDF document' },
  { type: 'application/zip', ext: '.zip', cat: 'App', desc: 'ZIP archive' },
  { type: 'application/gzip', ext: '.gz', cat: 'App', desc: 'GZip archive' },
  { type: 'application/xml', ext: '.xml', cat: 'App', desc: 'XML (app)' },
  { type: 'application/wasm', ext: '.wasm', cat: 'App', desc: 'WebAssembly' },
  { type: 'application/octet-stream', ext: '.bin', cat: 'App', desc: 'Binary' },
  { type: 'image/png', ext: '.png', cat: 'Image', desc: 'PNG image' },
  { type: 'image/jpeg', ext: '.jpg', cat: 'Image', desc: 'JPEG image' },
  { type: 'image/gif', ext: '.gif', cat: 'Image', desc: 'GIF image' },
  { type: 'image/webp', ext: '.webp', cat: 'Image', desc: 'WebP image' },
  { type: 'image/svg+xml', ext: '.svg', cat: 'Image', desc: 'SVG vector' },
  { type: 'image/avif', ext: '.avif', cat: 'Image', desc: 'AVIF image' },
  { type: 'image/bmp', ext: '.bmp', cat: 'Image', desc: 'BMP image' },
  { type: 'image/x-icon', ext: '.ico', cat: 'Image', desc: 'Favicon' },
  { type: 'audio/mpeg', ext: '.mp3', cat: 'Audio', desc: 'MP3 audio' },
  { type: 'audio/ogg', ext: '.ogg', cat: 'Audio', desc: 'OGG audio' },
  { type: 'audio/wav', ext: '.wav', cat: 'Audio', desc: 'WAV audio' },
  { type: 'audio/webm', ext: '.weba', cat: 'Audio', desc: 'WebM audio' },
  { type: 'audio/aac', ext: '.aac', cat: 'Audio', desc: 'AAC audio' },
  { type: 'video/mp4', ext: '.mp4', cat: 'Video', desc: 'MP4 video' },
  { type: 'video/webm', ext: '.webm', cat: 'Video', desc: 'WebM video' },
  { type: 'video/ogg', ext: '.ogv', cat: 'Video', desc: 'OGV video' },
  { type: 'video/x-msvideo', ext: '.avi', cat: 'Video', desc: 'AVI video' },
  { type: 'multipart/form-data', ext: '', cat: 'Form', desc: 'Form data' },
  { type: 'application/x-www-form-urlencoded', ext: '', cat: 'Form', desc: 'URL-encoded form' },
  { type: 'font/ttf', ext: '.ttf', cat: 'Font', desc: 'TrueType font' },
  { type: 'font/otf', ext: '.otf', cat: 'Font', desc: 'OpenType font' },
  { type: 'font/woff', ext: '.woff', cat: 'Font', desc: 'WOFF font' },
  { type: 'font/woff2', ext: '.woff2', cat: 'Font', desc: 'WOFF2 font' },
];

export default function MimeLookupPage() {
  const { addEntry } = useHistory();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(MIME_TYPES.map(m => m.cat)))], []);

  const results = useMemo(() => {
    let list = MIME_TYPES;
    if (cat !== 'All') list = list.filter(m => m.cat === cat);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(m => m.type.includes(q) || m.ext.includes(q) || m.desc.toLowerCase().includes(q));
  }, [query, cat]);

  const catColors = {
    Text: 'text-cat-text', App: 'text-cat-code', Image: 'text-cat-media',
    Audio: 'text-cat-media', Video: 'text-cat-media', Form: 'text-cat-network',
    Font: 'text-cat-design',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">M</span>
        <h1 className="font-heading text-2xl font-bold text-text">MIME Type Lookup</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-xl mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Search and browse common MIME types, extensions, and descriptions.</p>
          <input value={query} onChange={(e) => { setQuery(e.target.value); addEntry('MIME Type Lookup'); }} placeholder="Search by type, extension or description..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          <div className="flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${cat === c ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {results.map(m => (
              <div key={m.type} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface border border-border/50">
                <span className={`text-[10px] font-mono font-medium ${catColors[m.cat] || 'text-text-tertiary'}`}>{m.cat}</span>
                <span className="text-xs font-mono text-text flex-1">{m.type}</span>
                <span className="text-[10px] text-text-tertiary w-12">{m.ext || '—'}</span>
                <span className="text-[10px] text-text-tertiary flex-1 hidden sm:block">{m.desc}</span>
                <CopyButton text={m.type} className="text-[10px] shrink-0" />
              </div>
            ))}
            {results.length === 0 && <div className="text-text-tertiary text-sm text-center py-4">No matching MIME types.</div>}
          </div>
          <div className="text-xs text-text-tertiary text-center">{results.length} of {MIME_TYPES.length} types shown</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
