'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function generateUUIDv7() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const ms = Date.now();
  bytes[0] = (ms / 2 ** 40) & 0xff;
  bytes[1] = (ms / 2 ** 32) & 0xff;
  bytes[2] = (ms / 2 ** 24) & 0xff;
  bytes[3] = (ms / 2 ** 16) & 0xff;
  bytes[4] = (ms / 2 ** 8) & 0xff;
  bytes[5] = ms & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

function generateUUIDv4() {
  return crypto.randomUUID();
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseUUID(uuid) {
  if (!UUID_REGEX.test(uuid)) return null;
  const hex = uuid.replace(/-/g, '');
  const version = parseInt(hex[12], 16);
  const variant = (parseInt(hex[16], 16) >> 2);
  const ts = version === 7 ? parseInt(hex.slice(0, 12), 16) : null;
  return {
    uuid,
    version,
    variant: variant === 3 ? 'RFC 4122' : variant === 2 ? 'Microsoft' : 'NCS',
    timestamp: ts ? new Date(ts).toISOString() : null,
    isValid: true,
  };
}

function formatUUID(uuid, fmt) {
  const hex = uuid.replace(/-/g, '');
  if (fmt === 'nodash') return hex;
  if (fmt === 'upper') return uuid.toUpperCase();
  if (fmt === 'braces') return `{${uuid}}`;
  if (fmt === 'upper-nodash') return hex.toUpperCase();
  return uuid;
}

export default function UuidPage() {
  const { addEntry } = useHistory();
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState('v4');
  const [format, setFormat] = useState('standard');
  const [uuids, setUuids] = useState([]);
  const [error, setError] = useState('');
  const [validator, setValidator] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [showValidator, setShowValidator] = useState(false);

  const generate = useCallback(() => {
    setError('');
    try {
      const n = Math.min(Math.max(count, 1), 100);
      const result = [];
      for (let i = 0; i < n; i++) {
        result.push(version === 'v7' ? generateUUIDv7() : generateUUIDv4());
      }
      setUuids(result);
      addEntry('UUID Generator');
    } catch (e) {
      setError(e.message);
    }
  }, [count, version, addEntry]);

  const handleValidate = useCallback(() => {
    const trimmed = validator.trim();
    if (!trimmed) { setValidationResult(null); return; }
    const result = parseUUID(trimmed);
    setValidationResult(result ? { ...result, isValid: true } : { uuid: trimmed, isValid: false });
  }, [validator]);

  const exportAs = useCallback((type) => {
    if (uuids.length === 0) return;
    let content = '';
    if (type === 'json') content = JSON.stringify(uuids, null, 2);
    else if (type === 'csv') content = uuids.join(',');
    else if (type === 'sql') content = uuids.map(u => `('${u}')`).join(',\n');
    else if (type === 'array') content = `const uuids = [\n${uuids.map(u => `  '${u}'`).join(',\n')}\n];`;
    else content = uuids.join('\n');
    navigator.clipboard.writeText(content);
    addEntry('UUID Generator');
  }, [uuids, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⦿</span>
        <h1 className="font-heading text-2xl font-bold text-text">UUID Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Version:</span>
              {['v4', 'v7'].map((v) => (
                <button key={v} onClick={() => setVersion(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    version === v ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{v}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Count:</span>
              <input type="number" min={1} max={100} value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-16 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors text-center" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Format:</span>
              {['standard', 'nodash', 'upper', 'braces', 'upper-nodash'].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                    format === f ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{f === 'upper-nodash' ? 'UPPER' : f}</button>
              ))}
            </div>
            <button onClick={generate} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer ml-auto">Generate</button>
          </div>

          {version === 'v7' && (
            <div className="text-[10px] text-text-secondary bg-surface rounded-lg px-3 py-2 border border-border/50">
              UUID v7 is time-ordered (timestamp-prefixed), making it ideal for database primary keys and sortable identifiers.
            </div>
          )}
        </div>
      </GlassCard>

      {uuids.length > 0 && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated UUIDs ({uuids.length})</span>
              <div className="flex items-center gap-2">
                <CopyButton text={uuids.map(u => formatUUID(u, format)).join('\n')} />
              </div>
            </div>
            <div className="space-y-1">
              {uuids.map((uuid, i) => (
                <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text flex items-center gap-3 border border-border/50">
                  <span className="text-text-tertiary text-xs">#{i + 1}</span>
                  <span className="flex-1">{formatUUID(uuid, format)}</span>
                  <button onClick={() => navigator.clipboard.writeText(formatUUID(uuid, format))}
                    className="text-text-tertiary hover:text-text transition-colors text-xs cursor-pointer">Copy</button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['text', 'json', 'csv', 'sql', 'array'].map(type => (
                <button key={type} onClick={() => exportAs(type)}
                  className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">
                  Export as {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="p-4 space-y-3">
          <button onClick={() => setShowValidator(!showValidator)}
            className="text-xs text-text-secondary hover:text-text transition-colors cursor-pointer flex items-center gap-1">
            {showValidator ? '▼' : '▶'} UUID Validator & Parser
          </button>
          {showValidator && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={validator} onChange={(e) => setValidator(e.target.value)} placeholder="Paste UUID to validate..."
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={handleValidate}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Validate</button>
              </div>
              {validationResult && (
                <div className={`rounded-lg px-3 py-2 text-xs border ${
                  validationResult.isValid ? 'bg-cat-success/10 text-cat-success border-cat-success/20' : 'bg-cat-text/10 text-cat-text border-cat-text/20'
                }`}>
                  {validationResult.isValid ? (
                    <div className="space-y-1">
                      <div className="font-semibold">Valid UUID</div>
                      <div>Version: {validationResult.version}</div>
                      <div>Variant: {validationResult.variant}</div>
                      {validationResult.timestamp && <div>Timestamp: {validationResult.timestamp}</div>}
                    </div>
                  ) : (
                    <div>Invalid UUID format</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
