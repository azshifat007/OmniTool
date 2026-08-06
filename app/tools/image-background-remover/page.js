'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';
import { downloadBlob, downloadZip } from '@/lib/zip';

let uid = 0;
const nextId = () => `br-${++uid}-${Date.now()}`;

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function removeBackgroundFromFile(file, model, onStatus) {
  const { removeBackground } = await import('@imgly/background-removal');
  const dataUrl = await fileToDataUrl(file);
  return removeBackground(dataUrl, {
    model,
    output: { format: 'image/png' },
    progress: (key, current, total) => {
      const pct = total && total > 0 ? Math.round((current / total) * 100) : '';
      const label = key.startsWith('fetch')
        ? `Loading model${pct ? ` ${pct}%` : '…'}`
        : 'Removing background…';
      onStatus(label);
    },
  });
}

export default function ImageBackgroundRemoverPage() {
  const { addEntry } = useHistory();
  const [items, setItems] = useState([]);
  const [model, setModel] = useState('small');
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);

  const updateItem = useCallback((id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const processFiles = useCallback(async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    const added = list.map((file) => ({
      id: nextId(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      status: 'queued',
      statusMsg: '',
      resultUrl: '',
      resultSize: 0,
      error: '',
    }));
    setItems((prev) => [...prev, ...added]);
    for (const item of added) {
      updateItem(item.id, { status: 'processing', statusMsg: 'Starting…' });
      try {
        const blob = await removeBackgroundFromFile(item.file, model, (msg) =>
          updateItem(item.id, { statusMsg: msg })
        );
        updateItem(item.id, {
          status: 'done',
          resultUrl: URL.createObjectURL(blob),
          resultSize: blob.size,
          statusMsg: '',
        });
      } catch (err) {
        updateItem(item.id, { status: 'error', error: err.message || 'Processing failed' });
      }
    }
  }, [model, updateItem]);

  const onFiles = useCallback((files) => {
    processFiles(Array.from(files));
  }, [processFiles]);

  const downloadAll = useCallback(async () => {
    const done = items.filter((i) => i.status === 'done');
    if (!done.length) return;
    addEntry('Image Background Remover');
    const files = [];
    for (const item of done) {
      const blob = await fetch(item.resultUrl).then((r) => r.blob());
      const name = item.name.replace(/\.[^.]+$/, '') + '-removed.png';
      files.push({ name, data: new Uint8Array(await blob.arrayBuffer()) });
    }
    downloadZip('removed-backgrounds.zip', files);
  }, [items, addEntry]);

  const downloadOne = useCallback((item) => {
    addEntry('Image Background Remover');
    fetch(item.resultUrl)
      .then((r) => r.blob())
      .then((blob) => downloadBlob(blob, item.name.replace(/\.[^.]+$/, '') + '-removed.png'));
  }, [addEntry]);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target && target.url) URL.revokeObjectURL(target.url);
      if (target && target.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.url) URL.revokeObjectURL(i.url);
        if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
      });
      return [];
    });
  }, []);

  const doneCount = items.filter((i) => i.status === 'done').length;
  const processing = items.some((i) => i.status === 'processing' || i.status === 'queued');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl text-cat-media">🪄</span>
        <h1 className="font-heading text-2xl font-bold text-text">Image Background Remover</h1>
      </div>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">
        Cut any subject out of its background using an on-device AI model — one image or a whole batch, all inside your browser.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors ${over ? 'border-primary bg-primary/5' : ''}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }}
              />
              <div className="text-3xl mb-2 opacity-50">🪄</div>
              <p className="text-text-tertiary text-sm">Drop one or more images, or click to browse</p>
              <p className="text-[10px] text-text-tertiary mt-1">PNG, JPEG, WebP — multiple files supported</p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary block mb-2">Model quality</label>
                <div className="flex gap-2">
                  {[
                    { v: 'small', l: 'Small · fast' },
                    { v: 'medium', l: 'Medium · best' },
                  ].map((m) => (
                    <button
                      key={m.v}
                      onClick={() => setModel(m.v)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                        model === m.v ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:text-text'
                      }`}
                    >
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => downloadAll()}
                disabled={!doneCount}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/10"
              >
                Download all ({doneCount}) as .zip
              </button>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div>• AI runs on your device — images are never uploaded</div>
                <div>• The first run downloads a small model (~10 MB) once, then it&apos;s cached</div>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">
                Results {processing && '(processing…)'}
              </span>
              {items.length > 0 && (
                <button onClick={clearAll} className="text-[11px] text-text-tertiary hover:text-text transition-colors cursor-pointer">
                  Clear all
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary text-sm">
                Upload images to remove their backgrounds
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-bg rounded-xl border border-border p-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.url && <img src={item.url} alt={item.name} className="w-full h-full object-cover" />}
                      {item.status === 'processing' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-text truncate">{item.name}</p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {item.status === 'done' && item.resultSize
                          ? `${formatSize(item.size)} → ${formatSize(item.resultSize)} PNG`
                          : item.status === 'processing'
                            ? item.statusMsg || 'Working…'
                            : item.status === 'error'
                              ? item.error
                              : 'Queued'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.status === 'done' && item.resultUrl && (
                        <button
                          onClick={() => downloadOne(item)}
                          className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer"
                        >
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-2 py-1.5 text-[11px] text-text-tertiary hover:text-text transition-colors cursor-pointer"
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
