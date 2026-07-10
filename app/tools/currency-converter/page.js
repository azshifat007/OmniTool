'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const rates = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53,
  CHF: 0.88, CNY: 7.24, INR: 83.1, BRL: 5.05, MXN: 17.15, KRW: 1320,
  SEK: 10.25, NOK: 10.45, NZD: 1.63, SGD: 1.34, HKD: 7.82, TRY: 30.2,
  ZAR: 18.5, RUB: 89.5, PLN: 3.96, DKK: 6.85, THB: 35.1, IDR: 15600,
  MYR: 4.68, PHP: 55.8, CZK: 22.5, ILS: 3.65, CLP: 935, AED: 3.67,
};

const symbols = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
  CHF: 'Fr', CNY: '¥', INR: '₹', BRL: 'R$', MXN: 'Mex$', KRW: '₩',
  SEK: 'kr', NOK: 'kr', NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', TRY: '₺',
  ZAR: 'R', RUB: '₽', PLN: 'zł', DKK: 'kr', THB: '฿', IDR: 'Rp',
  MYR: 'RM', PHP: '₱', CZK: 'Kč', ILS: '₪', CLP: '$', AED: 'د.إ',
};

const currencies = Object.keys(rates);

export default function CurrencyConverterPage() {
  const { addEntry } = useHistory();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');

  const convert = useCallback(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return null;
    const inUsd = val / rates[from];
    return parseFloat((inUsd * rates[to]).toFixed(4));
  }, [amount, from, to]);

  const result = convert();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">$</span>
        <h1 className="font-heading text-2xl font-bold text-text">Currency Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">From</label>
                <select value={from} onChange={e => setFrom(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {currencies.map(c => <option key={c} value={c}>{c} {symbols[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">To</label>
                <select value={to} onChange={e => setTo(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {currencies.filter(c => c !== from).map(c => <option key={c} value={c}>{c} {symbols[c]}</option>)}
                </select>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Result</span>
                {result !== null && <CopyButton text={String(result)} />}
              </div>
              <div className="text-2xl font-mono text-text font-bold">
                {result !== null
                  ? `${symbols[from]}${amount} = ${symbols[to]}${result}`
                  : <span className="text-text-tertiary text-sm">Enter a valid amount</span>
                }
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                1 {from} = {(rates[to] / rates[from]).toFixed(6)} {to}
              </div>
            </div>
            {addEntry('Currency Converter') && null}
          </GlassCard>

          {result !== null && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">Quick conversions</span>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {[1, 10, 50, 100, 500, 1000].map(a => (
                    <div key={a} className="flex justify-between bg-surface rounded-lg px-3 py-1.5 border border-border/50 text-xs">
                      <span className="text-text-tertiary">{symbols[from]}{a.toLocaleString()}</span>
                      <span className="text-text font-mono">{symbols[to]}{parseFloat((a / rates[from] * rates[to]).toFixed(4)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <p className="text-xs text-text-tertiary mt-4 text-center">Rates are approximate and may not reflect current market values.</p>
    </motion.div>
  );
}
