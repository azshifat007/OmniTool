'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const WORD_LIST = [
  'apple','brave','charm','dawn','eagle','flame','grain','haven','ivory','jewel',
  'karma','lunar','maple','noble','ocean','pearl','quest','river','stone','tiger',
  'ultra','vivid','wheat','xenon','yield','zebra','atlas','blaze','coral','delta',
  'ember','frost','grove','hazel','infer','jolly','knots','lemon','mango','nexus',
  'olive','plumb','quilt','robin','solar','thorn','umbra','vigor','wren','xeric',
  'yearn','zesty','amber','bison','cedar','drift','fable','glyph','haste','index',
  'jasper','kayak','lotus','macro','nadir','orbit','prism','quark','renal','siren',
  'talon','umbel','vapor','waltz','xylem','yeast','zonal','alloy','bloom','clove',
];

const AMBIGUOUS = 'Il1O0o';

function generatePassword(opts) {
  const { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, noRepeats } = opts;
  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lower = 'abcdefghijklmnopqrstuvwxyz';
  let num = '0123456789';
  let sym = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (excludeAmbiguous) {
    upper = upper.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    lower = lower.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    num = num.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  }

  let chars = '';
  if (lowercase) chars += lower;
  if (uppercase) chars += upper;
  if (numbers) chars += num;
  if (symbols) chars += sym;

  if (!chars) return '';

  let result = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  if (noRepeats) {
    const used = new Set();
    for (let i = 0; i < length; i++) {
      let idx = array[i] % chars.length;
      let attempts = 0;
      while (used.has(chars[idx]) && attempts < chars.length) {
        idx = (idx + 1) % chars.length;
        attempts++;
      }
      if (attempts >= chars.length) return generatePassword(opts);
      used.add(chars[idx]);
      result += chars[idx];
    }
  } else {
    for (let i = 0; i < length; i++) result += chars[array[i] % chars.length];
  }

  return result;
}

function generatePassphrase(wordCount, separator, capitalize) {
  const array = new Uint32Array(wordCount);
  crypto.getRandomValues(array);
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    let word = WORD_LIST[array[i] % WORD_LIST.length];
    if (capitalize) word = word[0].toUpperCase() + word.slice(1);
    words.push(word);
  }
  return words.join(separator);
}

function calcEntropy(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  return pool > 0 ? Math.log2(pool) * password.length : 0;
}

function calcStrength(score) {
  if (score < 30) return { label: 'Weak', pct: 20, color: 'bg-cat-text' };
  if (score < 50) return { label: 'Fair', pct: 40, color: 'bg-cat-media' };
  if (score < 70) return { label: 'Good', pct: 60, color: 'bg-cat-document' };
  if (score < 100) return { label: 'Strong', pct: 80, color: 'bg-cat-success' };
  return { label: 'Very Strong', pct: 100, color: 'bg-cat-code' };
}

function crackTime(score) {
  const guessesPerSec = 1e10;
  const seconds = Math.pow(2, score) / guessesPerSec / 2;
  if (seconds < 1) return 'instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1e3) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1e3)}k years`;
  if (seconds < 31536000 * 1e9) return `${Math.round(seconds / 31536000 / 1e6)}M years`;
  return `${(seconds / 31536000 / 1e9).toExponential(1)} years`;
}

export default function PasswordPage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('password');
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [noRepeats, setNoRepeats] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pwHistory, setPwHistory] = useState([]);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('omnitool-pw-history') || '[]');
      if (Array.isArray(saved)) setPwHistory(saved);
    } catch {}
  }, []);

  const saveToHistory = useCallback((pw) => {
    setPwHistory(prev => {
      const next = [{ pw, time: Date.now() }, ...prev.filter(h => h.pw !== pw)].slice(0, 20);
      localStorage.setItem('omnitool-pw-history', JSON.stringify(next));
      return next;
    });
  }, []);

  const generate = useCallback(() => {
    setError('');
    if (mode === 'password') {
      if (!uppercase && !lowercase && !numbers && !symbols) {
        setError('Select at least one character type.');
        return;
      }
      const result = generatePassword({ length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, noRepeats });
      setPassword(result);
      saveToHistory(result);
    } else {
      const result = generatePassphrase(wordCount, separator, capitalize);
      setPassword(result);
      saveToHistory(result);
    }
    addEntry('Password Generator');
  }, [mode, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, noRepeats, wordCount, separator, capitalize, addEntry, saveToHistory]);

  const score = calcEntropy(password);
  const strength = calcStrength(score);
  const crack = crackTime(score);

  const charStats = password ? {
    upper: (password.match(/[A-Z]/g) || []).length,
    lower: (password.match(/[a-z]/g) || []).length,
    digits: (password.match(/\d/g) || []).length,
    special: (password.match(/[^a-zA-Z0-9]/g) || []).length,
  } : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">Password Generator</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3 flex gap-2">
            {['password', 'passphrase'].map(m => (
              <button key={m} onClick={() => { setMode(m); setPassword(''); setError(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                }`}>{m === 'password' ? 'Password' : 'Passphrase'}</button>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            {mode === 'password' ? (
              <>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Length: {length}</label>
                  <input type="range" min={4} max={128} value={length} onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-text-secondary"><span>4</span><span>128</span></div>
                </div>
                {[
                  { label: 'Uppercase (A-Z)', val: uppercase, set: setUppercase },
                  { label: 'Lowercase (a-z)', val: lowercase, set: setLowercase },
                  { label: 'Numbers (0-9)', val: numbers, set: setNumbers },
                  { label: 'Symbols (!@#)', val: symbols, set: setSymbols },
                ].map(({ label, val, set }) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={val} onChange={() => set(!val)}
                      className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                    <span className="text-sm text-text">{label}</span>
                  </label>
                ))}
                <div className="border-t border-border pt-3 space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={excludeAmbiguous} onChange={() => setExcludeAmbiguous(!excludeAmbiguous)}
                      className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                    <span className="text-sm text-text">Exclude ambiguous (I, l, 1, O, 0)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={noRepeats} onChange={() => setNoRepeats(!noRepeats)}
                      className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                    <span className="text-sm text-text">No repeated characters</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Words: {wordCount}</label>
                  <input type="range" min={2} max={8} value={wordCount} onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <div className="flex justify-between text-[10px] text-text-secondary"><span>2</span><span>8</span></div>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary mb-2 block">Separator</label>
                  <div className="flex flex-wrap gap-2">
                    {[{ v: '-', l: 'Dash' }, { v: '.', l: 'Dot' }, { v: ' ', l: 'Space' }, { v: '_', l: 'Under' }].map(s => (
                      <button key={s.v} onClick={() => setSeparator(s.v)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          separator === s.v ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                        }`}>{s.l}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={capitalize} onChange={() => setCapitalize(!capitalize)}
                    className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                  <span className="text-sm text-text">Capitalize words</span>
                </label>
              </>
            )}

            <button onClick={generate} className="w-full rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Generate {mode === 'password' ? 'Password' : 'Passphrase'}
            </button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Generated {mode === 'password' ? 'Password' : 'Passphrase'}</span>
                {password && <CopyButton text={password} />}
              </div>
              <div className="bg-surface rounded-lg px-3 py-4 text-center border border-border/50 min-h-[60px] flex items-center justify-center">
                {password ? (
                  <span className="text-lg font-mono tracking-wider text-text break-all leading-relaxed">{password}</span>
                ) : (
                  <span className="text-text-secondary text-sm">Click generate</span>
                )}
              </div>
              {password && charStats && (
                <div className="flex gap-3 mt-3 justify-center">
                  {charStats.upper > 0 && <span className="text-[10px] font-mono text-cat-design">A-Z: {charStats.upper}</span>}
                  {charStats.lower > 0 && <span className="text-[10px] font-mono text-cat-code">a-z: {charStats.lower}</span>}
                  {charStats.digits > 0 && <span className="text-[10px] font-mono text-cat-math">0-9: {charStats.digits}</span>}
                  {charStats.special > 0 && <span className="text-[10px] font-mono text-cat-security">!@#: {charStats.special}</span>}
                </div>
              )}
            </div>
          </GlassCard>

          {password && (
            <GlassCard>
              <div className="p-4 space-y-3">
                <span className="text-xs text-text-tertiary block">Strength Analysis</span>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${strength.pct}%` }}
                    className={`h-full rounded-full ${strength.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  <span className="text-xs text-text-secondary">{Math.round(score)} bits entropy</span>
                </div>
                <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <div className="text-[10px] text-text-tertiary">Estimated crack time (10B guesses/sec)</div>
                  <div className="text-sm font-mono font-semibold text-text mt-0.5">{crack}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-surface rounded-lg px-2 py-1.5 border border-border/50 text-text-secondary">
                    Length: <span className="text-text font-semibold">{password.length}</span>
                  </div>
                  <div className="bg-surface rounded-lg px-2 py-1.5 border border-border/50 text-text-secondary">
                    Charset: <span className="text-text font-semibold">
                      {(uppercase ? 26 : 0) + (lowercase ? 26 : 0) + (numbers ? 10 : 0) + (symbols ? 32 : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Password History ({pwHistory.length})</span>
                <div className="flex gap-2">
                  {pwHistory.length > 0 && (
                    <button onClick={() => { setPwHistory([]); localStorage.removeItem('omnitool-pw-history'); }}
                      className="text-[10px] text-text-tertiary hover:text-cat-text transition-colors cursor-pointer">Clear</button>
                  )}
                  <button onClick={() => setShowHistory(!showHistory)}
                    className="text-[10px] text-text-tertiary hover:text-text transition-colors cursor-pointer">
                    {showHistory ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {showHistory && pwHistory.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden">
                    {pwHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-surface border border-border/50 text-xs cursor-pointer hover:border-primary/30 transition-colors"
                        onClick={() => navigator.clipboard.writeText(h.pw)}>
                        <span className="font-mono text-text truncate flex-1">{h.pw}</span>
                        <span className="text-text-tertiary shrink-0">{new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {showHistory && pwHistory.length === 0 && (
                <div className="text-xs text-text-tertiary text-center py-4">No passwords generated yet</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
