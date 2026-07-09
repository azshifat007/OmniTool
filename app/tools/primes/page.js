'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function getFactors(n) {
  const factors = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
}

function primeFactorization(n) {
  const factors = [];
  let num = n;
  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factors.push(i);
      num = num / i;
    }
  }
  if (num > 1) factors.push(num);
  return factors;
}

function nthPrime(n) {
  let count = 0, candidate = 2;
  while (true) {
    if (isPrime(candidate)) {
      count++;
      if (candidate === n) return count;
    }
    candidate++;
    if (candidate > 1000000) return null;
  }
}

function nearestPrimes(n) {
  let below = n - 1;
  while (below >= 2) {
    if (isPrime(below)) break;
    below--;
  }
  let above = n + 1;
  while (above <= 10000000) {
    if (isPrime(above)) break;
    above++;
  }
  return { below: below >= 2 ? below : null, above: above <= 10000000 ? above : null };
}

function sieveRange(from, to) {
  const primes = [];
  for (let i = from; i <= to; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

export default function PrimesPage() {
  const { addEntry } = useHistory();
  const [num, setNum] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [rangeResult, setRangeResult] = useState(null);

  const checkPrime = useCallback(() => {
    const n = parseInt(num, 10);
    if (isNaN(n) || n < 1) return;
    const prime = isPrime(n);
    const result = { n, prime };
    if (!prime) {
      result.factors = getFactors(n);
      result.primeFactorization = primeFactorization(n);
    } else {
      result.position = nthPrime(n);
    }
    result.nearest = nearestPrimes(n);
    setSingleResult(result);
    addEntry('Prime Number Checker');
  }, [num, addEntry]);

  const checkRange = useCallback(() => {
    const f = parseInt(rangeFrom, 10);
    const t = parseInt(rangeTo, 10);
    if (isNaN(f) || isNaN(t) || f < 1 || t < f) return;
    const primes = sieveRange(f, t);
    setRangeResult({ from: f, to: t, primes, count: primes.length });
    addEntry('Prime Number Checker');
  }, [rangeFrom, rangeTo, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">#</span>
        <h1 className="font-heading text-2xl font-bold text-text">Prime Number Checker</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Check a Number</span>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Number</label>
              <input type="number" value={num} onChange={(e) => setNum(e.target.value)} placeholder="Enter a positive integer" min="1"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <button onClick={checkPrime}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Check
            </button>

            {singleResult && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-text">{singleResult.n}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${singleResult.prime ? 'bg-cat-success/20 text-cat-success' : 'bg-cat-text/20 text-cat-text'}`}>
                    {singleResult.prime ? 'Prime' : 'Not Prime'}
                  </span>
                </div>

                {singleResult.prime && singleResult.position && (
                  <div className="text-xs text-text-tertiary">
                    #{singleResult.position} prime (the {singleResult.position}th prime number)
                  </div>
                )}

                {!singleResult.prime && (
                  <>
                    <div className="text-xs text-text-tertiary">
                      Factors ({singleResult.factors.length}): {singleResult.factors.join(', ')}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Prime Factorization: {singleResult.primeFactorization.join(' × ')}
                    </div>
                  </>
                )}

                <div className="text-xs text-text-tertiary">
                  Nearest prime below: {singleResult.nearest.below ?? 'none'}
                  {' | '}Nearest prime above: {singleResult.nearest.above ?? 'none'}
                </div>

                <CopyButton text={String(singleResult.n)} />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Check a Range</span>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">From</label>
                <input type="number" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} placeholder="1" min="1"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-tertiary mb-1 block">To</label>
                <input type="number" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} placeholder="100" min="1"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <button onClick={checkRange}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Find Primes
            </button>

            {rangeResult && (
              <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-2 max-h-[400px] overflow-y-auto">
                <div className="text-xs text-text-tertiary">
                  Found {rangeResult.count} prime{rangeResult.count !== 1 ? 's' : ''} between {rangeResult.from} and {rangeResult.to}
                </div>
                {rangeResult.count > 0 && (
                  <div className="text-xs font-mono text-text leading-relaxed break-all">
                    {rangeResult.primes.join(', ')}
                  </div>
                )}
                <CopyButton text={rangeResult.primes.join(', ')} />
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
