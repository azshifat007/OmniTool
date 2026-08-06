'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(str) {
  const cleaned = str.replace(/[^A-Za-z2-7]/g, '').toUpperCase();
  const bits = [];
  for (const ch of cleaned) {
    const val = BASE32.indexOf(ch);
    if (val === -1) continue;
    for (let i = 4; i >= 0; i--) bits.push((val >> i) & 1);
  }
  const bytes = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

function base32Encode(bytes) {
  let bits = '';
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits += (b >> i) & 1;
  }
  let result = '';
  for (let i = 0; i + 4 < bits.length; i += 5) {
    let val = 0;
    for (let j = 0; j < 5; j++) val = (val << 1) | (bits[i + j] || 0);
    result += BASE32[val];
  }
  return result;
}

function randomSecret(length = 20) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

function counterBytes(num, length = 8) {
  const bytes = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = Math.floor(num / 0x100);
  }
  return bytes;
}

async function hmacSign(keyBytes, dataBytes, algorithm) {
  const algo = algorithm === 'SHA1' ? 'SHA-1' : 'SHA-256';
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algo }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, dataBytes));
}

function truncate(hash, digits) {
  const offset = hash[hash.length - 1] & 0xf;
  const binary = ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

async function totp(secret, algorithm, digits, interval) {
  const keyBytes = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / interval);
  const hash = await hmacSign(keyBytes, counterBytes(counter), algorithm);
  return truncate(hash, digits);
}

export default function OtpPage() {
  const { addEntry } = useHistory();
  const [issuer, setIssuer] = useState('OmniTool');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA1');
  const [digits, setDigits] = useState(6);
  const [interval, setInterval] = useState(30);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!secret) setSecret(randomSecret());
  }, []);

  useEffect(() => {
    if (!secret) return;
    let cancelled = false;
    const gen = async () => {
      setError('');
      try {
        const otp = await totp(secret, algorithm, digits, interval);
        if (!cancelled) setCode(otp);
      } catch (e) {
        if (!cancelled) setError('Failed: ' + e.message);
      }
    };
    gen();
    const id = setInterval(gen, interval * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [secret, algorithm, digits, interval]);

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const c = Math.floor(now / interval);
      setTimeLeft((c + 1) * interval - now);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [interval]);

  const handleGenerate = useCallback(async () => {
    setError('');
    try {
      setCode(await totp(secret, algorithm, digits, interval));
      addEntry('OTP Generator');
    } catch (e) {
      setError('Failed: ' + e.message);
    }
  }, [secret, algorithm, digits, interval, addEntry]);

  const uri = `otpauth://totp/${encodeURIComponent(issuer)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${algorithm}&digits=${digits}&period=${interval}`;
  const progress = (timeLeft / interval) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">&#9883;</span>
        <h1 className="font-heading text-2xl font-bold text-text">OTP Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Issuer / Label</label>
              <input value={issuer} onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. GitHub"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Secret Key (Base32)</label>
              <div className="flex gap-2">
                <input value={secret} onChange={(e) => setSecret(e.target.value.toUpperCase())}
                  placeholder="JBSWY3DPEHPK3PXP"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={() => setSecret(randomSecret())}
                  className="px-2 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">New</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Algorithm</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                <option value="SHA1">SHA-1</option>
                <option value="SHA256">SHA-256</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Digits: {digits}</label>
              <input type="range" min={6} max={8} step={2} value={digits}
                onChange={(e) => setDigits(parseInt(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-text-secondary"><span>6</span><span>8</span></div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Interval: {interval}s</label>
              <input type="range" min={30} max={60} step={30} value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-text-secondary"><span>30s</span><span>60s</span></div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4 text-center">
              <span className="text-xs text-text-tertiary block mb-4">Current TOTP Code</span>
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.2em] text-text mb-4 select-all">
                {code || '\u2014\u2014\u2014\u2014\u2014\u2014'}
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-primary"
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </div>
                <span className="text-xs text-text-secondary">{timeLeft}s remaining</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Provisioning URI</span>
                <CopyButton text={uri} />
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text-secondary break-all border border-border/50">
                {uri}
              </div>
            </div>
          </GlassCard>

          <div className="flex gap-2">
            <CopyButton text={secret} />
            <button onClick={handleGenerate}
              className="flex-1 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate Now</button>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
