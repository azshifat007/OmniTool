'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function BcryptPage() {
  const { addEntry } = useHistory();
  const [password, setPassword] = useState('');
  const [salt, setSalt] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [hash, setHash] = useState('');
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = useCallback(async () => {
    setError('');
    if (!password.trim()) { setError('Enter a password.'); return; }
    try {
      const result = await sha256(salt + password);
      setHash(result);
      addEntry('SHA Hash Verifier');
    } catch (e) {
      setError(e.message);
    }
  }, [password, salt, addEntry]);

  const handleVerify = useCallback(async () => {
    setError('');
    if (!password.trim() || !verifyHash.trim()) { setError('Enter both password and hash to verify.'); return; }
    try {
      const result = await sha256(salt + password);
      setMatch(result.toLowerCase() === verifyHash.trim().toLowerCase());
      addEntry('SHA Hash Verifier');
    } catch (e) {
      setError(e.message);
    }
  }, [password, salt, verifyHash, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">SHA Hash Verifier</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Password / Text</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter text to hash..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Salt (optional, prepended)</label>
              <input value={salt} onChange={(e) => setSalt(e.target.value)} placeholder="e.g. random_salt"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Existing Hash (to verify against)</label>
              <input value={verifyHash} onChange={(e) => setVerifyHash(e.target.value)} placeholder="Paste hash to verify..."
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleGenerate} className="flex-1 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate Hash</button>
              <button onClick={handleVerify} className="flex-1 px-4 py-2 text-xs font-medium rounded-lg bg-surface text-text border border-border hover:bg-border/30 transition-all cursor-pointer">Verify</button>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">SHA-256 Hash</span>
                {hash && <CopyButton text={hash} />}
              </div>
              <div className="bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text break-all border border-border/50 min-h-[60px]">
                {hash || <span className="text-text-secondary">Generated hash...</span>}
              </div>
            </div>
          </GlassCard>

          {match !== null && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-2 block">Verification Result</span>
                <div className={`rounded-lg px-3 py-3 text-sm font-medium border ${match ? 'bg-cat-success/10 text-cat-success border-cat-success/20' : 'bg-cat-text/10 text-cat-text border-cat-text/20'}`}>
                  {match ? 'Hash matches!' : 'Hash does not match'}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-2 block">Note</span>
          <p className="text-xs text-text-secondary leading-relaxed">
            This tool uses SHA-256 via the Web Crypto API. For production password storage,
            use dedicated libraries that implement bcrypt, scrypt, or Argon2 with proper
            salting and stretching.
          </p>
        </div>
      </GlassCard>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
