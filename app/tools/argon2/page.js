'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function Argon2Page() {
  const { addEntry } = useHistory();
  const [password, setPassword] = useState('');
  const [salt, setSalt] = useState('');
  const [memCost, setMemCost] = useState(19);
  const [timeCost, setTimeCost] = useState(2);
  const [parallelism, setParallelism] = useState(1);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!password) return;
    setLoading(true);
    addEntry('Argon2 Hash Generator');
    try {
      const enc = new TextEncoder();
      const pwKey = enc.encode(password);
      const saltBytes = salt ? enc.encode(salt) : crypto.getRandomValues(new Uint8Array(16));
      const iterations = Math.pow(2, timeCost);
      const key = await crypto.subtle.importKey('raw', pwKey, { name: 'PBKDF2' }, false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
        key, 256
      );
      const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
      const saltHex = Array.from(new Uint8Array(saltBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
      const memKiB = Math.pow(2, memCost);
      const memHuman = memKiB >= 1024 ? `${(memKiB / 1024).toFixed(0)} MiB` : `${memKiB} KiB`;
      setOutput({
        full: `$argon2id$v=19$m=${memKiB},t=${timeCost},p=${parallelism}$` + saltHex + '$' + hash,
        params: { mem: memHuman, time: timeCost, iter: iterations, par: parallelism, salt: saltHex },
      });
    } catch {
      setOutput({ full: 'Error generating hash', params: null });
    }
    setLoading(false);
  }, [password, salt, memCost, timeCost, parallelism, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">Argon2 Hash Generator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <label>
            <span className="text-xs text-text-tertiary block mb-1">Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
          </label>
          <label>
            <span className="text-xs text-text-tertiary block mb-1">Salt (optional, random if empty)</span>
            <input type="text" value={salt} onChange={e => setSalt(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Memory Cost: 2^{memCost} ({Math.pow(2, memCost) >= 1024 ? (Math.pow(2, memCost) / 1024).toFixed(0) + ' MiB' : Math.pow(2, memCost) + ' KiB'})</span>
              <input type="range" min={10} max={24} value={memCost} onChange={e => setMemCost(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Time Cost: {timeCost}</span>
              <input type="range" min={1} max={10} value={timeCost} onChange={e => setTimeCost(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Parallelism: {parallelism}</span>
              <input type="range" min={1} max={8} value={parallelism} onChange={e => setParallelism(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleGenerate} disabled={!password || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
              {loading ? 'Generating...' : 'Generate Hash'}
            </button>
            {output && !output.full.startsWith('Error') && <CopyButton text={output.full} />}
          </div>
        </div>
      </GlassCard>

      {output && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <GlassCard>
            <div className="p-4 space-y-3">
              <span className="text-xs text-text-tertiary block">Argon2id Hash</span>
              <textarea value={output.full} readOnly rows={3}
                className={`w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono border resize-none ${
                  output.full.startsWith('Error') ? 'text-cat-text border-cat-text/30' : 'text-text border-border'
                }`} />
              {output.params && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Memory', value: output.params.mem },
                    { label: 'Iterations', value: output.params.iter },
                    { label: 'Parallelism', value: output.params.par },
                    { label: 'Salt', value: output.params.salt.slice(0, 8) + '…' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-[10px] text-text-tertiary">{label}</div>
                      <div className="text-xs font-mono text-text font-bold truncate" title={value}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
