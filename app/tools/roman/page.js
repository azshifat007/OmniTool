'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const romanMap = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(num) {
  if (num < 1 || num > 3999) return null;
  let result = '';
  let n = num;
  for (const [val, sym] of romanMap) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

function fromRoman(str) {
  const u = str.toUpperCase().trim();
  if (!u) return null;
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  if (![...u].every((c) => vals[c])) return null;
  let total = 0;
  for (let i = 0; i < u.length; i++) {
    const cur = vals[u[i]];
    const next = vals[u[i + 1]];
    if (next && cur < next) { total += next - cur; i++; }
    else total += cur;
  }
  return total < 1 || total > 3999 ? null : total;
}

const tests = [
  [1, 'I'], [4, 'IV'], [9, 'IX'],
  [42, 'XLII'], [99, 'XCIX'], [2024, 'MMXXIV'],
];

export default function RomanPage() {
  const { addEntry } = useHistory();
  const [number, setNumber] = useState('2024');
  const [roman, setRoman] = useState('MMXXIV');
  const [result, setResult] = useState(null);

  const convertToRoman = () => {
    const num = parseInt(number, 10);
    if (isNaN(num)) { setResult({ error: 'Enter a valid number' }); return; }
    const r = toRoman(num);
    setResult(r ? { text: `${num} = ${r}`, roman: r } : { error: 'Must be 1-3999' });
    addEntry('Roman Numeral Converter');
  };

  const convertFromRoman = () => {
    const n = fromRoman(roman);
    setResult(n ? { text: `${roman.toUpperCase()} = ${n}`, roman: roman.toUpperCase() } : { error: 'Invalid Roman numeral' });
    addEntry('Roman Numeral Converter');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">R</span>
        <h1 className="font-heading text-2xl font-bold text-text">Roman Numeral Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Number → Roman</label>
              <div className="flex gap-2">
                <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} min={1} max={3999} placeholder="Enter number"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={convertToRoman} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-xs text-text-tertiary mb-2 block">Roman → Number</label>
              <div className="flex gap-2">
                <input value={roman} onChange={(e) => setRoman(e.target.value)} placeholder="Enter Roman numeral"
                  className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={convertFromRoman} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
              </div>
            </div>

            {result && (
              <div className={`rounded-lg p-3 ${result.error ? 'bg-cat-text/10 border border-cat-text/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                {result.error ? (
                  <div className="text-xs text-cat-text">{result.error}</div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-text">{result.text}</span>
                    <CopyButton text={result.roman} />
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Reference</span>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">I</div>
                  <div className="text-center text-[10px] text-text-secondary">1</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">V</div>
                  <div className="text-center text-[10px] text-text-secondary">5</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">X</div>
                  <div className="text-center text-[10px] text-text-secondary">10</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">L</div>
                  <div className="text-center text-[10px] text-text-secondary">50</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">C</div>
                  <div className="text-center text-[10px] text-text-secondary">100</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">D</div>
                  <div className="text-center text-[10px] text-text-secondary">500</div>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-border col-span-2">
                  <div className="text-lg text-center font-serif font-bold text-cat-math">M</div>
                  <div className="text-center text-[10px] text-text-secondary">1000</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-text-tertiary mb-1 block">Examples</span>
                <div className="flex flex-wrap gap-1.5">
                  {tests.map(([num, rom]) => (
                    <button key={num} onClick={() => { setNumber(String(num)); setRoman(rom); }}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{num} = {rom}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
