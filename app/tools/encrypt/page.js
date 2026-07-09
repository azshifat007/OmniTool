'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function b64ToBytes(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

function bytesToB64(buf) {
  const b = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
  return btoa(bin);
}

async function deriveKey(password, salt, mode) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    km,
    { name: mode, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export default function EncryptPage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('AES-CBC');
  const [plaintext, setPlaintext] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPassword, setDecryptPassword] = useState('');

  const handleEncrypt = useCallback(async () => {
    setError('');
    try {
      if (!plaintext.trim()) { setError('Enter text to encrypt.'); return; }
      if (!password) { setError('Enter a password.'); return; }
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(mode === 'AES-GCM' ? 12 : 16));
      const key = await deriveKey(password, salt, mode);
      const enc = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt({ name: mode, iv }, key, enc.encode(plaintext));
      const combined = bytesToB64(new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]));
      setResult(combined);
      addEntry('Encryption Tool');
    } catch (e) {
      setError(e.message);
    }
  }, [plaintext, password, mode, addEntry]);

  const handleDecrypt = useCallback(async () => {
    setError('');
    try {
      const raw = decryptInput.trim();
      if (!raw) { setError('Paste the encrypted data.'); return; }
      if (!decryptPassword) { setError('Enter the password.'); return; }
      const buf = b64ToBytes(raw);
      const ivLen = mode === 'AES-GCM' ? 12 : 16;
      if (buf.length < 16 + ivLen + 1) { setError('Data too short.'); return; }
      const salt = buf.slice(0, 16);
      const iv = buf.slice(16, 16 + ivLen);
      const data = buf.slice(16 + ivLen);
      const key = await deriveKey(decryptPassword, salt, mode);
      const dec = await crypto.subtle.decrypt({ name: mode, iv }, key, data);
      setResult(new TextDecoder().decode(dec));
      addEntry('Encryption Tool');
    } catch {
      setError('Decryption failed. Wrong password or corrupted data.');
    }
  }, [decryptInput, decryptPassword, mode, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">🔒</span>
        <h1 className="font-heading text-2xl font-bold text-text">Encryption Tool</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Algorithm</label>
            <div className="flex gap-2">
              {['AES-CBC', 'AES-GCM'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setResult(''); setError(''); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{m}</button>
              ))}
            </div>
          </div>

          <div className="border-b border-border" />

          <div>
            <label className="text-xs text-text-tertiary mb-3 block">Plaintext</label>
            <textarea value={plaintext} onChange={(e) => setPlaintext(e.target.value)} rows={4}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter text to encrypt..." />
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="Encryption password" />
          </div>

          <button onClick={handleEncrypt}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Encrypt</button>

          <div className="border-b border-border" />

          <div>
            <label className="text-xs text-text-tertiary mb-3 block">Decrypt</label>
            <textarea value={decryptInput} onChange={(e) => setDecryptInput(e.target.value)} rows={3}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste the full encrypted blob (base64)..." />
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Password</label>
            <input type="password" value={decryptPassword} onChange={(e) => setDecryptPassword(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors"
              placeholder="Decryption password" />
          </div>

          <button onClick={handleDecrypt}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-surface text-text border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">Decrypt</button>
        </div>
      </GlassCard>

      {result && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Result</span>
              <CopyButton text={result} />
            </div>
            <div className="bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text break-all border border-border/50 min-h-[60px]">
              {result}
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="mt-4">
        <div className="p-4">
          <p className="text-xs text-text-tertiary leading-relaxed">
            The encrypted blob contains salt (16 bytes), IV ({mode === 'AES-GCM' ? '12' : '16'} bytes), and ciphertext combined as base64.
            To decrypt, paste the full blob and enter the password.
          </p>
        </div>
      </GlassCard>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
