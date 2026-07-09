'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const cardPatterns = [
  { name: 'Visa', prefix: ['4'], lengths: [13, 16, 19], color: 'bg-blue-600' },
  { name: 'Mastercard', prefix: ['51', '52', '53', '54', '55', '2221', '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229', '223', '224', '225', '226', '227', '228', '229', '23', '24', '25', '26', '271', '2720'], lengths: [16], color: 'bg-orange-600' },
  { name: 'American Express', prefix: ['34', '37'], lengths: [15], color: 'bg-blue-800' },
  { name: 'Discover', prefix: ['6011', '65', '644', '645', '646', '647', '648', '649', '622'], lengths: [16, 19], color: 'bg-yellow-600' },
  { name: 'Diners Club', prefix: ['300', '301', '302', '303', '304', '305', '36', '38', '39'], lengths: [14, 16, 19], color: 'bg-green-700' },
  { name: 'JCB', prefix: ['3528', '3529', '353', '354', '355', '356', '357', '358'], lengths: [16, 17, 18, 19], color: 'bg-red-600' },
  { name: 'Maestro', prefix: ['5018', '5020', '5038', '56', '57', '58', '6304', '6759', '6761', '6762', '6763'], lengths: [12, 13, 14, 15, 16, 17, 18, 19], color: 'bg-purple-600' },
  { name: 'UnionPay', prefix: ['62'], lengths: [16, 17, 18, 19], color: 'bg-teal-600' },
];

function luhnCheck(num) {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCard(num) {
  const digits = num.replace(/\D/g, '');
  for (const card of cardPatterns) {
    const lenOk = card.lengths.includes(digits.length);
    const prefixOk = card.prefix.some((p) => digits.startsWith(p));
    if (lenOk && prefixOk) return card;
    if (prefixOk && !lenOk) return { ...card, partial: true };
  }
  return null;
}

function formatCard(num) {
  const digits = num.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4));
  return parts.join(' ').trim();
}

export default function CreditCardPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const digits = input.replace(/\D/g, '');
  const detected = detectCard(digits);
  const valid = digits.length > 0 ? luhnCheck(digits) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⌘</span>
        <h1 className="font-heading text-2xl font-bold text-text">Credit Card Validator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Card Number</label>
              <input value={input} onChange={(e) => setInput(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="4111 1111 1111 1111"
                maxLength={23}
                className="w-full bg-surface rounded-lg px-3 py-3 text-lg font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors tracking-wider" />
            </div>

            {digits.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-tertiary">Luhn check:</span>
                  {valid ? (
                    <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Valid</span>
                  ) : (
                    <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Invalid</span>
                  )}
                </div>

                {detected && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary">Card type:</span>
                    <span className={`text-xs font-medium text-white px-2 py-0.5 rounded-full ${detected.color}`}>
                      {detected.name}
                      {detected.partial && ' (partial)'}
                    </span>
                  </div>
                )}

                {!detected && digits.length >= 6 && (
                  <div className="text-xs text-text-secondary">Unknown card type</div>
                )}

                <div className="text-xs text-text-tertiary font-mono">{digits.length} digits</div>
              </div>
            )}

            {valid && detected && !detected.partial && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-xs font-medium text-green-500 mb-1">Valid {detected.name} card</div>
                <div className="text-[10px] text-text-secondary font-mono">{formatCard(digits)}</div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs text-text-tertiary mb-3 block">Card Preview</span>
            <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-400 font-mono">{detected?.name || 'CARD'}</span>
                <span className="text-xs text-gray-400">💳</span>
              </div>
              <div>
                <div className="text-lg font-mono text-white tracking-[0.15em] mb-2">
                  {formatCard(digits) || <span className="text-gray-500">···· ···· ···· ····</span>}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>VALID THRU</span>
                  <span>••/••</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-xs text-text-tertiary block">Test numbers</span>
              {[
                ['Visa', '4111111111111111'],
                ['Mastercard', '5555555555554444'],
                ['Amex', '378282246310005'],
                ['Discover', '6011111111111117'],
              ].map(([name, num]) => (
                <button key={num} onClick={() => setInput(num)}
                  className="text-[11px] text-primary hover:text-primary-dark font-mono cursor-pointer block">
                  {name}: {formatCard(num)}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
