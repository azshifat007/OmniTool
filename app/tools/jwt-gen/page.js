'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function b64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hmacSha256(message, secret) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, msgData))
    .then(sig => b64UrlEncode(String.fromCharCode(...new Uint8Array(sig))));
}

export default function JwtGenPage() {
  const { addEntry } = useHistory();
  const [payloadJson, setPayloadJson] = useState('{"sub":"1234567890","name":"John Doe","iat":1516239022}');
  const [secret, setSecret] = useState('my-secret-key');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setError('');
    setToken('');
    setLoading(true);
    addEntry('JWT Generator');
    try {
      const payload = JSON.parse(payloadJson);
      const header = { alg: 'HS256', typ: 'JWT' };
      const headerB64 = b64UrlEncode(JSON.stringify(header));
      const payloadB64 = b64UrlEncode(JSON.stringify(payload));
      const signature = await hmacSha256(`${headerB64}.${payloadB64}`, secret);
      setToken(`${headerB64}.${payloadB64}.${signature}`);
    } catch (e) {
      setError(e.message || 'Invalid JSON payload.');
    } finally {
      setLoading(false);
    }
  }, [payloadJson, secret, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">◈</span>
        <h1 className="font-heading text-2xl font-bold text-text">JWT Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Payload (JSON)</label>
              <textarea value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} rows={6}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Secret</label>
              <input value={secret} onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button onClick={generate} disabled={loading}
              className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">
              {loading ? 'Generating...' : 'Generate Token'}
            </button>
            {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated JWT</span>
              {token && <CopyButton text={token} className="text-xs" />}
            </div>
            <pre className="bg-surface rounded-xl p-4 text-xs font-mono text-text break-all border border-border/50 min-h-[120px] whitespace-pre-wrap">{token || <span className="text-text-tertiary">Token appears here...</span>}</pre>
            {token && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-text-tertiary">
                <span className="w-2 h-2 rounded-full bg-cat-success" /> HS256 signed
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
