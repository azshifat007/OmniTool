'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';
import { getFFmpeg, convertMedia, resetFFmpeg } from '@/lib/ffmpeg';

const fmtBytes = (n) => {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export default function MediaConverter({ config }) {
  const { addEntry } = useHistory();
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState(config.defaultFormat);
  const [options, setOptions] = useState(() => {
    const init = {};
    config.options.forEach((o) => { init[o.key] = o.default; });
    return init;
  });
  const [engine, setEngine] = useState('idle');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const cancelRef = useRef(false);
  const inputRef = useRef(null);

  const fmt = useMemo(() => config.formats.find((f) => f.ext === format) || config.formats[0], [config, format]);

  const busy = engine === 'loading' || status === 'converting';

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith('video/') && !f.type.startsWith('audio/') && !/\.(mp4|webm|mov|mkv|avi|m4v|mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(f.name)) {
      setError('Unsupported file type. Please choose a video or audio file.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const convert = useCallback(async () => {
    if (!file || busy) return;
    cancelRef.current = false;
    setError('');
    setResult(null);
    setProgress(0);
    setElapsed(0);
    setStatus('converting');
    addEntry(config.title);

    const base = file.name.replace(/\.[^.]+$/, '') || 'converted';
    const outName = `${base}-converted.${fmt.ext}`;

    const started = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);

    try {
      if (engine !== 'ready') {
        setEngine('loading');
        await getFFmpeg();
        setEngine('ready');
      }
      const { blob, fileName } = await convertMedia({
        file,
        args: ['-y', '-i', '{input}', ...fmt.args(options), outName],
        outName,
        onProgress: setProgress,
      });
      if (cancelRef.current) return;
      setResult({ blob, fileName, before: file.size, after: blob.size });
      setStatus('done');
    } catch (e) {
      if (cancelRef.current) return;
      setStatus('error');
      setError(e.message || 'Conversion failed. Try a smaller file or a different format.');
      console.error(e);
    } finally {
      clearTimer();
      if (!cancelRef.current) setProgress(100);
    }
  }, [file, fmt, options, busy, engine, addEntry, config.title]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
    resetFFmpeg();
    clearTimer();
    setEngine('idle');
    setStatus('idle');
    setProgress(0);
  }, []);

  useEffect(() => () => clearTimer(), []);

  const srcUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const isAudio = useMemo(() => file && (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(file.name)), [file]);

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(result.blob);
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl text-cat-media">{config.icon}</span>
        <h1 className="font-heading text-2xl font-bold text-text">{config.title}</h1>
      </div>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">{config.tagline}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <GlassCard>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                file ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={config.accept}
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <div className="text-3xl mb-2">{file ? '✅' : '📁'}</div>
              <div className="text-sm font-medium text-text">
                {file ? file.name : 'Drop a file here or click to browse'}
              </div>
              <div className="text-xs text-text-tertiary mt-1">{fmtBytes(file?.size)}</div>
            </div>
          </GlassCard>

          {file && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-2 block">Source</span>
                {isAudio ? (
                  <audio controls src={srcUrl} className="w-full" />
                ) : (
                  <video controls src={srcUrl} className="w-full rounded-xl max-h-64 bg-black" />
                )}
              </div>
            </GlassCard>
          )}

          {result && (
            <GlassCard>
              <div className="p-4 space-y-3">
                <span className="text-xs text-text-tertiary">Converted · {result.fileName}</span>
                {result.blob.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(result.blob)} alt="GIF result" className="w-full rounded-xl bg-black" />
                ) : result.blob.type.startsWith('audio/') ? (
                  <audio controls src={URL.createObjectURL(result.blob)} className="w-full" />
                ) : (
                  <video controls src={URL.createObjectURL(result.blob)} className="w-full rounded-xl max-h-64 bg-black" />
                )}
                <div className="flex gap-2 items-center">
                  <button onClick={download} className="flex-1 rounded-xl px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                    Download · {fmtBytes(result.after)}
                  </button>
                  {result.before > result.after && (
                    <span className="text-[10px] text-cat-success font-mono">
                      −{Math.round((1 - result.after / result.before) * 100)}%
                    </span>
                  )}
                  <button onClick={() => setResult(null)} className="px-3 py-2 text-xs font-medium rounded-xl bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">
                    ✕
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

          {error && (
            <div className="text-xs text-cat-text bg-cat-text/5 border border-cat-text/20 rounded-xl px-4 py-3">{error}</div>
          )}
        </div>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-5 space-y-5">
              <div>
                <span className="text-xs text-text-tertiary mb-2 block">Output format</span>
                <div className="flex flex-wrap gap-2">
                  {config.formats.map((f) => (
                    <button
                      key={f.ext}
                      onClick={() => { if (!busy) { setFormat(f.ext); setResult(null); } }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        format === f.ext
                          ? 'bg-primary-solid text-white border-primary-solid shadow-lg shadow-primary/20'
                          : 'bg-surface text-text-secondary border-border hover:text-text hover:border-primary/30'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {config.options.length > 0 && (
                <div className="space-y-4">
                  {config.options.map((o) => (
                    <div key={o.key}>
                      <span className="text-xs text-text-tertiary mb-2 block">{o.label}</span>
                      {o.type === 'select' ? (
                        <select
                          value={options[o.key]}
                          disabled={busy}
                          onChange={(e) => setOptions((s) => ({ ...s, [o.key]: e.target.value }))}
                          className="w-full bg-surface rounded-xl px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {o.choices.map((c) => (
                            <option key={c.v} value={c.v}>{c.l}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={o.min}
                            max={o.max}
                            value={options[o.key]}
                            disabled={busy}
                            onChange={(e) => setOptions((s) => ({ ...s, [o.key]: Number(e.target.value) }))}
                            className="flex-1 accent-primary cursor-pointer"
                          />
                          <span className="w-10 text-right text-sm font-mono text-text">{options[o.key]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {busy ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">
                      {engine === 'loading'
                        ? 'Loading engine — first run downloads ~30 MB (one-time, cached)…'
                        : `Converting… ${progress}%`}
                    </span>
                    <span className="text-text-tertiary font-mono">{elapsed}s</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                    <div
                      className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ${engine === 'loading' ? 'animate-marquee w-1/3' : ''}`}
                      style={{ width: engine === 'loading' ? undefined : `${progress}%` }}
                    />
                  </div>
                  <button onClick={cancel} className="w-full rounded-xl px-4 py-2 text-xs font-medium bg-surface text-text-secondary border border-border hover:text-cat-text hover:border-cat-text/40 transition-all cursor-pointer">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={convert}
                  disabled={!file}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-primary/10"
                >
                  Convert to {fmt.label}
                </button>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Privacy</span>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div>• 100% in-browser via WebAssembly — files never leave your device</div>
                <div>• First conversion downloads the ffmpeg engine (~30 MB, then cached)</div>
                <div>• Best for clips under a few minutes / ~300 MB</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
