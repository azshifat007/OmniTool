'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function entropy(password) {
  const sets = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/];
  let pool = 0;
  sets.forEach(re => { if (re.test(password)) pool += re.source.length > 4 ? 32 : re === /[a-z]/ || re === /[A-Z]/ ? 26 : 10; });
  return pool > 0 ? Math.log2(pool) * password.length : 0;
}

const strengthColors = {
  Weak: 'bg-cat-text',
  Fair: 'bg-cat-media',
  Good: 'bg-cat-document',
  Strong: 'bg-cat-success',
  'Very Strong': 'bg-cat-code',
};

function strengthLabel(score) {
  if (score < 30) return { label: 'Weak', pct: 20 };
  if (score < 50) return { label: 'Fair', pct: 40 };
  if (score < 70) return { label: 'Good', pct: 60 };
  if (score < 100) return { label: 'Strong', pct: 80 };
  return { label: 'Very Strong', pct: 100 };
}

export default function PasswordPage() {
  const { addEntry } = useHistory();
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const generate = useCallback(() => {
    setError('');
    if (!uppercase && !lowercase && !numbers && !symbols) {
      setError('Select at least one character type.'); return;
    }
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    const sym = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let chars = '';
    if (lowercase) chars += lower;
    if (uppercase) chars += upper;
    if (numbers) chars += num;
    if (symbols) chars += sym;
    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) result += chars[array[i] % chars.length];
    setPassword(result);
    addEntry('Password Generator');
  }, [length, uppercase, lowercase, numbers, symbols, addEntry]);

  const score = entropy(password);
  const strength = strengthLabel(score);
  const barClass = strengthColors[strength.label];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">Password Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Length: {length}</label>
              <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-text-secondary"><span>4</span><span>64</span></div>
            </div>

            {[
              { label: 'Uppercase (A-Z)', key: 'uppercase', val: uppercase, set: setUppercase },
              { label: 'Lowercase (a-z)', key: 'lowercase', val: lowercase, set: setLowercase },
              { label: 'Numbers (0-9)', key: 'numbers', val: numbers, set: setNumbers },
              { label: 'Symbols (!@#)', key: 'symbols', val: symbols, set: setSymbols },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={val} onChange={() => set(!val)}
                  className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-sm text-text">{label}</span>
              </label>
            ))}

            <button onClick={generate} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate Password</button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Generated Password</span>
                {password && <CopyButton text={password} />}
              </div>
              <div className="bg-surface rounded-lg px-3 py-4 text-center border border-border/50">
                <span className="text-lg font-mono tracking-wider text-text break-all">{password || <span className="text-text-secondary text-sm">Click generate</span>}</span>
              </div>
            </div>
          </GlassCard>

          {password && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Strength</span>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${strength.pct}%` }}
                      className={`h-full rounded-full ${barClass}`} />
                </div>
                <span className={`text-xs font-medium mt-2 block ${barClass.replace('bg-', 'text-')}`}>{strength.label} ({Math.round(score)} bits)</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
