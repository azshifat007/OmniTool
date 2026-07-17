'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function convertHundreds(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(ones[Math.floor(n / 100)] + ' hundred');
    n %= 100;
  }
  if (n >= 20) {
    parts.push(tens[Math.floor(n / 10)]);
    n %= 10;
  }
  if (n > 0) {
    parts.push(ones[n]);
  }
  return parts.join(' ') || 'zero';
}

function numberToWords(n) {
  if (n === 0) return 'zero';
  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;
  const parts = [];
  if (billions) parts.push(convertHundreds(billions) + ' billion');
  if (millions) parts.push(convertHundreds(millions) + ' million');
  if (thousands) parts.push(convertHundreds(thousands) + ' thousand');
  if (remainder || parts.length === 0) parts.push(convertHundreds(remainder));
  return parts.join(' ');
}

function numberToOrdinal(n) {
  if (n === 0) return 'zeroth';
  const words = numberToWords(n);
  if (words.endsWith('y')) return words.slice(0, -1) + 'ieth';
  if (words.endsWith('e')) return words + 'th';
  if (words.endsWith('ve')) return words.slice(0, -2) + 'fth';
  return words + 'th';
}

function toRoman(n) {
  if (n < 1 || n > 3999) return null;
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let num = n, result = '';
  for (const [val, sym] of map) {
    while (num >= val) {
      result += sym;
      num -= val;
    }
  }
  return result;
}

function formatDecimal(str) {
  return str.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export default function NumwordsPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [caseStyle, setCaseStyle] = useState('capitalize');

  const result = useMemo(() => {
    const val = input.replace(/,/g, '');
    if (!val || isNaN(parseFloat(val))) return null;

    const num = parseFloat(val);
    if (num < 0 || num > 999999999999) return null;

    const parts = val.split('.');
    const intPart = parseInt(parts[0], 10) || 0;
    const decPart = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;

    let words = numberToWords(intPart);
    if (decPart > 0) {
      words += ' point ' + numberToWords(decPart);
    }

    const ordinal = intPart <= 999999999 ? numberToOrdinal(intPart) : null;
    const roman = intPart >= 1 && intPart <= 3999 ? toRoman(intPart) : null;
    const currency = `${numberToWords(intPart)} dollar${intPart === 1 ? '' : 's'}${decPart > 0 ? ` and ${numberToWords(decPart)} cents` : ''}`;

    addEntry('Number to Words');

    const applyCase = (s) => caseStyle === 'upper' ? s.toUpperCase()
      : caseStyle === 'lower' ? s.toLowerCase() : s.charAt(0).toUpperCase() + s.slice(1);

    return { words: applyCase(words), ordinal, roman, currency, intPart, decPart, formatted: formatDecimal(val) };
  }, [input, caseStyle, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">~</span>
        <h1 className="font-heading text-2xl font-bold text-text">Number to Words</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Number</label>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a number (e.g. 1234567.89)"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            {result && (
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 text-[11px] text-text-tertiary">
                <span className="font-mono">{result.formatted}</span>
                {result.decPart > 0 && <span className="font-mono">.{result.decPart}</span>}
              </div>
            )}

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Case Style</label>
              <div className="flex gap-2">
                {[['capitalize', 'Title'], ['lower', 'lower'], ['upper', 'UPPER']].map(([v, l]) => (
                  <button key={v} onClick={() => setCaseStyle(v)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${caseStyle === v ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Conversion</span>

            {!result ? (
              <div className="text-sm text-text-tertiary">Enter a number to see it in words</div>
            ) : (
              <>
                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                  <div className="text-xs text-text-tertiary mb-1">In Words</div>
                  <div className="text-sm text-text font-semibold leading-relaxed capitalize">
                    {result.words}
                  </div>
                  <CopyButton text={result.words} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {result.ordinal && (
                    <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-text-tertiary">Ordinal</div>
                        <CopyButton text={result.ordinal} className="text-[10px]" />
                      </div>
                      <div className="text-sm font-mono text-text">{result.ordinal}</div>
                    </div>
                  )}
                  {result.roman && (
                    <div className="bg-surface rounded-lg px-3 py-2 border border-border/50 col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-text-tertiary">Roman Numerals</div>
                        <CopyButton text={result.roman} className="text-[10px]" />
                      </div>
                      <div className="text-sm font-mono text-text">{result.roman}</div>
                    </div>
                  )}
                </div>

                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50">
                  <div className="text-xs text-text-tertiary mb-1">Currency (English)</div>
                  <div className="text-sm text-text font-semibold leading-relaxed">{result.currency}</div>
                  <CopyButton text={result.currency} />
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
