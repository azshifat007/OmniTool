'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function isbn10Check(num) {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(num[i], 10) * (10 - i);
  }
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? 'X' : String(check);
}

function isbn13Check(num) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(num[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
}

function cleanIsbn(str) {
  return str.replace(/[-\s]/g, '');
}

function validateIsbn(str) {
  const cleaned = cleanIsbn(str);
  if (cleaned.length === 10) {
    const digits = cleaned.slice(0, 9);
    if (!/^\d{9}$/.test(digits)) return { valid: false, error: 'Invalid ISBN-10 format' };
    const check = cleaned[9].toUpperCase();
    const expected = isbn10Check(digits);
    return {
      valid: check === expected,
      type: 'ISBN-10',
      checkDigit: check,
      givenCheck: check,
      expectedCheck: expected,
      group: digits[0] === '0' || digits[0] === '1' ? 'English' :
             digits[0] === '2' ? 'French' :
             digits[0] === '3' ? 'German' :
             digits[0] === '4' ? 'Japan' :
             digits[0] === '5' ? 'Russia' :
             digits[0] === '7' ? 'China' : 'Other',
    };
  }
  if (cleaned.length === 13) {
    if (!/^\d{13}$/.test(cleaned)) return { valid: false, error: 'Invalid ISBN-13 format' };
    const digits = cleaned.slice(0, 12);
    const check = cleaned[12];
    const expected = isbn13Check(digits);
    const prefix = cleaned.slice(0, 3);
    return {
      valid: check === expected,
      type: 'ISBN-13',
      checkDigit: check,
      givenCheck: check,
      expectedCheck: expected,
      prefix: prefix,
      group: prefix === '978' ? 'Bookland (978)' : prefix === '979' ? 'Bookland (979)' : 'Unknown',
    };
  }
  return { valid: false, error: 'Must be 10 or 13 digits' };
}

function isbn10to13(isbn10) {
  const cleaned = cleanIsbn(isbn10).slice(0, 9);
  if (cleaned.length !== 9 || !/^\d{9}$/.test(cleaned)) return '';
  const base = '978' + cleaned;
  return base + isbn13Check(base);
}

function isbn13to10(isbn13) {
  const cleaned = cleanIsbn(isbn13);
  if (cleaned.length !== 13 || !/^\d{13}$/.test(cleaned)) return '';
  if (cleaned.slice(0, 3) !== '978') return '(only 978 prefix can convert)';
  const base = cleaned.slice(3, 12);
  return base + isbn10Check(base);
}

function formatIsbn(str) {
  const c = cleanIsbn(str);
  if (c.length === 10) return `${c.slice(0, 1)}-${c.slice(1, 4)}-${c.slice(4, 9)}-${c.slice(9)}`;
  if (c.length === 13) return `${c.slice(0, 3)}-${c.slice(3, 4)}-${c.slice(4, 7)}-${c.slice(7, 12)}-${c.slice(12)}`;
  return str;
}

const tests = [
  ['ISBN-10', '0306406152'],
  ['ISBN-10', '020161622X'],
  ['ISBN-13', '9780306406157'],
  ['ISBN-13', '9780201616224'],
];

export default function IsbnPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [converted, setConverted] = useState('');

  const check = () => {
    const r = validateIsbn(input);
    setResult(r);
    if (r.type === 'ISBN-10' && r.valid) {
      setConverted(isbn10to13(input));
    } else if (r.type === 'ISBN-13' && r.valid && r.prefix === '978') {
      setConverted(isbn13to10(input));
    } else {
      setConverted('');
    }
    addEntry('ISBN Validator');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">ISBN</span>
        <h1 className="font-heading text-2xl font-bold text-text">ISBN Validator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter ISBN-10 or ISBN-13"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              <button onClick={check} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Validate</button>
            </div>

            {result && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${result.valid ? 'text-green-500' : 'text-cat-text'}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${result.valid ? 'bg-green-500/10' : 'bg-cat-text/10'}`}>
                    {result.valid ? 'Valid' : 'Invalid'}
                  </span>
                  <span className="text-xs text-text-secondary">{result.type}</span>
                </div>

                {result.valid && (
                  <>
                    <div className="text-xs text-text-secondary font-mono">{formatIsbn(input)}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-surface rounded-lg p-2 border border-border">
                        <div className="text-[10px] text-text-tertiary">Check Digit</div>
                        <div className="text-sm font-mono font-bold text-text">{result.checkDigit}</div>
                      </div>
                      <div className="bg-surface rounded-lg p-2 border border-border">
                        <div className="text-[10px] text-text-tertiary">Group</div>
                        <div className="text-sm font-mono font-bold text-text">{result.group || result.prefix}</div>
                      </div>
                    </div>

                    {converted && (
                      <div className="bg-surface rounded-lg p-3 border border-border">
                        <div className="text-[10px] text-text-tertiary mb-1">
                          {result.type === 'ISBN-10' ? 'ISBN-13 Equivalent' : 'ISBN-10 Equivalent'}
                        </div>
                        <div className="text-sm font-mono font-bold text-text">{formatIsbn(converted)}</div>
                        <CopyButton text={converted} />
                      </div>
                    )}
                  </>
                )}

                {result.error && <div className="text-xs text-cat-text">{result.error}</div>}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Test Numbers</span>
            <div className="space-y-2">
              {tests.map(([type, num]) => (
                <button key={num} onClick={() => setInput(num)}
                  className="w-full text-left p-2 rounded-lg bg-surface border border-border hover:border-primary/40 transition-all cursor-pointer">
                  <span className="text-[10px] text-text-tertiary">{type}</span>
                  <div className="text-xs font-mono text-text">{formatIsbn(num)}</div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
