'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  return atob(padded);
}

function formatExpiry(exp) {
  const d = new Date(exp * 1000);
  const now = Date.now();
  const diff = d.getTime() - now;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  let relative;
  if (diff < 0) relative = 'Expired';
  else if (days > 0) relative = `Expires in ${days}d ${hours % 24}h`;
  else if (hours > 0) relative = `Expires in ${hours}h ${mins % 60}m`;
  else relative = `Expires in ${mins}m`;

  return {
    date: d.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }),
    relative,
    expired: diff < 0,
  };
}

export default function JwtPage() {
  const { addEntry } = useHistory();
  const [token, setToken] = useState('');
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [error, setError] = useState('');

  const handleDecode = useCallback(() => {
    setError('');
    setHeader(null);
    setPayload(null);
    setExpiry(null);
    if (!token.trim()) return;
    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) { setError('Invalid JWT format. Expected 3 dot-separated parts.'); return; }
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      setHeader(decodedHeader);
      setPayload(decodedPayload);
      if (decodedPayload.exp) {
        setExpiry(formatExpiry(decodedPayload.exp));
      }
      addEntry('JWT Debugger');
    } catch (e) {
      setError('Failed to decode: ' + e.message);
    }
  }, [token, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">🔐</span>
        <h1 className="font-heading text-2xl font-bold text-text">JWT Debugger</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-3 block">JWT Token</label>
          <div className="flex gap-2">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..."
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={handleDecode} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Decode</button>
          </div>
        </div>
      </GlassCard>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}

      {header && payload && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">HEADER: ALGORITHM & TOKEN TYPE</span>
                <CopyButton text={JSON.stringify(header, null, 2)} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto max-h-48 whitespace-pre">{JSON.stringify(header, null, 2)}</pre>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">PAYLOAD: DATA</span>
                <CopyButton text={JSON.stringify(payload, null, 2)} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto max-h-48 whitespace-pre">{JSON.stringify(payload, null, 2)}</pre>
            </div>
          </GlassCard>
        </div>
      )}

      {expiry && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">EXPIRATION</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${expiry.expired ? 'text-cat-text' : 'text-cat-code'}`}>
                {expiry.relative}
              </span>
              <span className="text-xs text-text-secondary">{expiry.date}</span>
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
