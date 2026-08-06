'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function LoanPage() {
  const { addEntry } = useHistory();
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);
  const [calculated, setCalculated] = useState(null);

  const handleCalc = useCallback(() => {
    addEntry('Loan Calculator');
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    const interest = total - amount;
    const schedule = [];
    let bal = amount;
    for (let i = 1; i <= n; i++) {
      const ip = bal * r;
      const pp = monthly - ip;
      bal -= pp;
      schedule.push({ month: i, payment: monthly, principal: pp, interest: ip, balance: Math.max(bal, 0) });
    }
    setCalculated({ monthly, total, interest, schedule });
  }, [amount, rate, years, addEntry]);

  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">💰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Loan Calculator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Loan Amount</span>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Interest Rate (%)</span>
              <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Term (years)</span>
              <input type="number" value={years} onChange={e => setYears(Number(e.target.value))}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            </label>
          </div>
          <button onClick={handleCalc}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
            Calculate
          </button>
        </div>
      </GlassCard>

      {calculated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-primary">{fmt(calculated.monthly)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Monthly Payment</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-text">{fmt(calculated.total)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Total Payment</div>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <div className="text-lg font-bold font-heading text-cat-accent">{fmt(calculated.interest)}</div>
                  <div className="text-xs text-text-tertiary mt-1">Total Interest</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary block mb-3">Amortization Schedule (first 12 months)</span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-tertiary border-b border-border">
                      <th className="text-left py-2 pr-3">#</th>
                      <th className="text-right py-2 pr-3">Payment</th>
                      <th className="text-right py-2 pr-3">Principal</th>
                      <th className="text-right py-2 pr-3">Interest</th>
                      <th className="text-right py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculated.schedule.slice(0, 12).map(s => (
                      <tr key={s.month} className="border-b border-border/50">
                        <td className="py-1.5 pr-3 text-text-secondary">{s.month}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-text">{fmt(s.payment)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-cat-success">{fmt(s.principal)}</td>
                        <td className="py-1.5 pr-3 text-right font-mono text-cat-text">{fmt(s.interest)}</td>
                        <td className="py-1.5 text-right font-mono text-text-secondary">{fmt(s.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
