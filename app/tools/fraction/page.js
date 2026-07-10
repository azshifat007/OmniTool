'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function toFraction(decimal, maxDen = 1000) {
  if (!decimal && decimal !== 0) return null;
  if (Number.isInteger(decimal)) return { num: decimal, den: 1, mixed: '' };
  const sign = decimal < 0 ? -1 : 1;
  decimal = Math.abs(decimal);
  let bestNum = 1, bestDen = 1, bestDiff = Math.abs(decimal - 1);
  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(decimal * den);
    const diff = Math.abs(decimal - num / den);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestNum = num;
      bestDen = den;
    }
  }
  const g = gcd(bestNum, bestDen);
  let num = (bestNum / g) * sign;
  let den = bestDen / g;
  let mixed = '';
  if (Math.abs(num) >= den) {
    const whole = Math.floor(Math.abs(num) / den) * Math.sign(num);
    const rem = Math.abs(num) % den;
    mixed = rem === 0 ? `${whole}` : `${whole} ${rem}/${den}`;
  }
  return { num, den, mixed: mixed || `${num}/${den}` };
}

export default function FractionPage() {
  const { addEntry } = useHistory();
  const [decimal, setDecimal] = useState('0.75');
  const [maxDen, setMaxDen] = useState(1000);
  const [result, setResult] = useState(null);

  const convert = useCallback(() => {
    addEntry('Fraction Converter');
    const d = parseFloat(decimal);
    if (isNaN(d)) { setResult(null); return; }
    setResult(toFraction(d, maxDen));
  }, [decimal, maxDen, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">½</span>
        <h1 className="font-heading text-2xl font-bold text-text">Fraction Converter</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Convert decimals to fractions with adjustable denominator precision.</p>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Decimal</label>
            <input type="number" step="any" value={decimal} onChange={(e) => setDecimal(e.target.value)}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">Max Denominator: {maxDen}</label>
            <input type="range" min={10} max={10000} step={10} value={maxDen} onChange={(e) => setMaxDen(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer" />
            <div className="flex justify-between text-[10px] text-text-tertiary">
              <span>10</span><span>10000</span>
            </div>
          </div>
          <button onClick={convert} className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Convert</button>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center pt-4 space-y-3">
              <div className="text-4xl font-bold font-heading text-text font-mono">
                <span className="text-2xl">{result.num}</span>
                <span className="text-text-tertiary">/</span>
                <span className="text-2xl">{result.den}</span>
              </div>
              {result.mixed && result.mixed !== `${result.num}/${result.den}` && (
                <div className="text-lg text-text-secondary">
                  = {result.mixed}
                </div>
              )}
              <div className="text-xs text-text-tertiary">
                {parseFloat(decimal)} = {result.num}/{result.den}
              </div>
              <div className="flex justify-center"><CopyButton text={`${result.num}/${result.den}`} className="text-xs" /></div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
