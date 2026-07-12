'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

const HASH_LENGTHS = {
  'SHA-1': 160,
  'SHA-256': 256,
  'SHA-384': 384,
  'SHA-512': 512,
};

async function hashData(data, algorithm) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashFile(file, algorithm) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function HashPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [hashAll, setHashAll] = useState(true);
  const [outputs, setOutputs] = useState({});
  const [error, setError] = useState('');
  const [mode, setMode] = useState('text');
  const [fileInfo, setFileInfo] = useState(null);
  const [fileHashes, setFileHashes] = useState({});
  const [hashing, setHashing] = useState(false);
  const [hmacKey, setHmacKey] = useState('');
  const [useHmac, setUseHmac] = useState(false);
  const [hmacOutputs, setHmacOutputs] = useState({});
  const fileInputRef = useRef(null);

  const handleHash = useCallback(async () => {
    if (!input.trim()) { setOutputs({}); setHmacOutputs({}); return; }
    setError('');
    try {
      const algosToUse = hashAll ? algos : [algorithm];
      const results = {};
      for (const algo of algosToUse) {
        results[algo] = await hashData(input, algo);
      }
      setOutputs(results);

      if (useHmac && hmacKey) {
        const hmacResults = {};
        const encoder = new TextEncoder();
        for (const algo of algosToUse) {
          const key = await crypto.subtle.importKey('raw', encoder.encode(hmacKey), { name: 'HMAC', hash: algo }, false, ['sign']);
          const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
          hmacResults[algo] = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        setHmacOutputs(hmacResults);
      } else {
        setHmacOutputs({});
      }
      addEntry('Hash Generator');
    } catch (e) {
      setError(e.message);
      setOutputs({});
    }
  }, [input, algorithm, hashAll, hmacKey, useHmac, addEntry]);

  const handleFileHash = useCallback(async (file) => {
    setHashing(true);
    setError('');
    setFileInfo({ name: file.name, size: file.size, type: file.type || 'unknown' });
    try {
      const results = {};
      for (const algo of algos) {
        results[algo] = await hashFile(file, algo);
      }
      setFileHashes(results);
      addEntry('Hash Generator');
    } catch (e) {
      setError('Failed to hash file: ' + e.message);
      setFileHashes({});
    }
    setHashing(false);
  }, [addEntry]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileHash(file);
  }, [handleFileHash]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">Hash Generator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {['text', 'file'].map(m => (
                <button key={m} onClick={() => { setMode(m); setOutputs({}); setFileHashes({}); setFileInfo(null); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{m === 'text' ? 'Text' : 'File'}</button>
              ))}
            </div>
            {mode === 'text' && (
              <>
                <div className="h-4 w-px bg-border" />
                <div className="flex gap-2">
                  {algos.map((a) => (
                    <button key={a} onClick={() => { setAlgorithm(a); setHashAll(false); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        !hashAll && algorithm === a ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                      }`}>{a}</button>
                  ))}
                </div>
                <button onClick={() => setHashAll(!hashAll)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    hashAll ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>All</button>
              </>
            )}
          </div>
        </GlassCard>
      </div>

      {mode === 'text' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <GlassCard>
              <div className="p-4">
                <label className="text-xs text-text-tertiary mb-3 block">Input Text</label>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Enter text to hash..." />
              </div>
            </GlassCard>
            <GlassCard>
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={useHmac} onChange={() => setUseHmac(!useHmac)}
                    className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                  <span className="text-sm text-text">HMAC (keyed hash)</span>
                </label>
                {useHmac && (
                  <div>
                    <label className="text-xs text-text-tertiary mb-1 block">HMAC Key</label>
                    <input value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Enter secret key..."
                      className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                )}
                <button onClick={handleHash} className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate Hash</button>
              </div>
            </GlassCard>
          </div>
          <div className="space-y-4">
            {Object.keys(outputs).length > 0 && (
              <GlassCard>
                <div className="p-4 space-y-3">
                  <span className="text-xs text-text-tertiary block">Hash Output</span>
                  {Object.entries(outputs).map(([algo, hash]) => (
                    <div key={algo} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-tertiary font-semibold">{algo} ({HASH_LENGTHS[algo]} bits)</span>
                        <CopyButton text={hash} />
                      </div>
                      <div className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text break-all border border-border/50">{hash}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
            {Object.keys(hmacOutputs).length > 0 && (
              <GlassCard>
                <div className="p-4 space-y-3">
                  <span className="text-xs text-text-tertiary block">HMAC Output</span>
                  {Object.entries(hmacOutputs).map(([algo, hash]) => (
                    <div key={algo} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-tertiary font-semibold">HMAC-{algo}</span>
                        <CopyButton text={hash} />
                      </div>
                      <div className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text break-all border border-border/50">{hash}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard>
            <div className="p-4">
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
                <input ref={fileInputRef} type="file" onChange={(e) => e.target.files[0] && handleFileHash(e.target.files[0])} className="hidden" />
                <div className="text-3xl mb-2 opacity-50">📁</div>
                <p className="text-text-tertiary text-sm">Drop a file here or click to browse</p>
                <p className="text-text-secondary text-xs mt-1">Any file type supported</p>
              </div>
              {fileInfo && (
                <div className="mt-3 bg-surface rounded-lg px-3 py-2 text-xs border border-border/50 space-y-0.5">
                  <div className="text-text font-medium">{fileInfo.name}</div>
                  <div className="text-text-secondary">{formatSize(fileInfo.size)} · {fileInfo.type}</div>
                </div>
              )}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary block">File Hashes {hashing && '(hashing...)'}</span>
              {Object.keys(fileHashes).length > 0 ? (
                Object.entries(fileHashes).map(([algo, hash]) => (
                  <div key={algo} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-tertiary font-semibold">{algo}</span>
                      <CopyButton text={hash} />
                    </div>
                    <div className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text break-all border border-border/50">{hash}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-text-tertiary text-center py-6">Drop a file to compute hashes</div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
