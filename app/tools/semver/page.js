'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseSemver(v) {
  const re = /^v?(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;
  const m = v.trim().match(re);
  if (!m) return null;
  return { major: parseInt(m[1]), minor: parseInt(m[2]), patch: parseInt(m[3]), pre: m[4] || '', build: m[5] || '' };
}

function compare(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (a.pre && !b.pre) return -1;
  if (!a.pre && b.pre) return 1;
  if (a.pre && b.pre) return a.pre.localeCompare(b.pre);
  return 0;
}

function validate(v) {
  if (!v.trim()) return { valid: false, error: 'Version string is empty' };
  const re = /^v?(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;
  if (!re.test(v.trim())) return { valid: false, error: 'Invalid semver format. Expected: major.minor.patch (e.g. 1.2.3)' };
  return { valid: true };
}

export default function SemverPage() {
  const { addEntry } = useHistory();
  const [v1, setV1] = useState('1.0.0');
  const [v2, setV2] = useState('2.0.0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCompare = useCallback(() => {
    setError('');
    const err1 = validate(v1);
    if (!err1.valid) { setError('Version 1: ' + err1.error); setResult(null); return; }
    const err2 = validate(v2);
    if (!err2.valid) { setError('Version 2: ' + err2.error); setResult(null); return; }
    const a = parseSemver(v1);
    const b = parseSemver(v2);
    const cmp = compare(a, b);
    setResult({ a, b, cmp });
    addEntry('SemVer Compare');
  }, [v1, v2, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">SV</span>
        <h1 className="font-heading text-2xl font-bold text-text">SemVer Compare</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Version 1</label>
              <input value={v1} onChange={(e) => setV1(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" placeholder="1.0.0" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Version 2</label>
              <input value={v2} onChange={(e) => setV2(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" placeholder="2.0.0" />
            </div>
          </div>
          <button onClick={handleCompare} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Compare</button>
        </div>
      </GlassCard>
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
          <GlassCard>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-tertiary">Version 1</span><span className="font-mono text-text">{result.a.major}.{result.a.minor}.{result.a.patch}{result.a.pre ? '-' + result.a.pre : ''}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Version 2</span><span className="font-mono text-text">{result.b.major}.{result.b.minor}.{result.b.patch}{result.b.pre ? '-' + result.b.pre : ''}</span></div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                <span className="text-text-tertiary">Result</span>
                <span className={`font-semibold ${result.cmp < 0 ? 'text-cat-success' : result.cmp > 0 ? 'text-cat-text' : 'text-cat-date'}`}>
                  {result.cmp < 0 ? `${v1} < ${v2}` : result.cmp > 0 ? `${v1} > ${v2}` : `${v1} = ${v2}`}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
