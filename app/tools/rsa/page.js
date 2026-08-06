'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function pemEncode(label, bytes) {
  const b64 = btoa(String.fromCharCode(...bytes));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function ab2bytes(ab) {
  return new Uint8Array(ab);
}

function exportPem(key, type) {
  return crypto.subtle.exportKey('spki', key).then((ab) => pemEncode('PUBLIC KEY', ab2bytes(ab)))
    .then((pub) => {
      if (type === 'keypair') {
        return crypto.subtle.exportKey('pkcs8', key).then((ab) => ({
          publicKey: pub,
          privateKey: pemEncode('PRIVATE KEY', ab2bytes(ab)),
        }));
      }
      return { publicKey: pub };
    });
}

export default function RsaPage() {
  const { addEntry } = useHistory();
  const [keySize, setKeySize] = useState(2048);
  const [generating, setGenerating] = useState(false);
  const [keys, setKeys] = useState(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['encrypt', 'decrypt']
      );
      const result = await exportPem(keyPair.privateKey, 'keypair');
      setKeys(result);
      addEntry('RSA Key Generator');
    } catch (e) {
      setError(e.message || 'Key generation failed');
    }
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">RSA Key Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Key Size</label>
              <select value={keySize} onChange={(e) => setKeySize(parseInt(e.target.value))}
                className="bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                <option value={1024}>1024 bits</option>
                <option value={2048}>2048 bits</option>
                <option value={4096}>4096 bits</option>
              </select>
            </div>
            <button onClick={generate} disabled={generating}
              className="mt-5 px-6 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">
              {generating ? 'Generating...' : 'Generate Key Pair'}
            </button>
          </div>

          {error && <div className="text-xs text-cat-text">{error}</div>}

          {keys && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">Public Key</span>
                  <CopyButton text={keys.publicKey} />
                </div>
                <pre className="bg-surface rounded-lg p-3 text-[10px] font-mono text-text border border-border whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{keys.publicKey}</pre>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-tertiary">Private Key</span>
                  <CopyButton text={keys.privateKey} />
                </div>
                <pre className="bg-surface rounded-lg p-3 text-[10px] font-mono text-text border border-border whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{keys.privateKey}</pre>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
