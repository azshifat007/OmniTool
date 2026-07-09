'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function TipPage() {
  const { addEntry } = useHistory();
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);
  const [roundUp, setRoundUp] = useState(false);

  const result = useMemo(() => {
    const b = parseFloat(bill);
    if (isNaN(b) || b <= 0) return null;
    const rawTip = b * (tipPct / 100);
    const tip = roundUp ? Math.ceil(rawTip) : rawTip;
    const total = b + tip;
    const perPerson = total / people;
    const tipPerPerson = tip / people;
    return { bill: b, tip, total, perPerson, tipPerPerson, tipPct, people, roundUp };
  }, [bill, tipPct, people, roundUp]);

  const handleBillChange = useCallback((e) => {
    setBill(e.target.value);
    if (e.target.value.trim()) addEntry('Tip Calculator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">$</span>
        <h1 className="font-heading text-2xl font-bold text-text">Tip Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-5">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Bill Amount ($)</label>
              <input type="number" value={bill} onChange={handleBillChange} placeholder="0.00" min="0" step="0.01"
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-text-tertiary">Tip: {tipPct}%</label>
                <span className="text-xs font-mono text-text-secondary">{tipPct}%</span>
              </div>
              <input type="range" min="5" max="50" value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                <span>5%</span><span>50%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-text-tertiary">Number of People</label>
                <span className="text-xs font-mono text-text-secondary">{people}</span>
              </div>
              <input type="range" min="1" max="20" value={people} onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                <span>1</span><span>20</span>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
              <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)}
                className="accent-primary cursor-pointer" />
              Round up tip
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Tip Breakdown</span>

            {!result ? (
              <div className="text-sm text-text-tertiary">Enter a bill amount to see breakdown</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tip Total', value: `$${result.tip.toFixed(2)}` },
                    { label: 'Total Bill', value: `$${result.total.toFixed(2)}` },
                    { label: 'Per Person', value: `$${result.perPerson.toFixed(2)}` },
                    { label: 'Tip / Person', value: `$${result.tipPerPerson.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <div className="text-xs text-text-tertiary">{label}</div>
                      <div className="text-lg font-bold font-mono text-text">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-1">
                  <div className="text-xs text-text-tertiary">Summary</div>
                  <div className="text-xs font-mono text-text">
                    ${result.bill.toFixed(2)} + {result.tipPct}% tip{result.roundUp ? ' (rounded up)' : ''} = ${result.total.toFixed(2)}
                  </div>
                  <div className="text-xs font-mono text-text">
                    Split {result.people} way{result.people > 1 ? 's' : ''}: ${result.perPerson.toFixed(2)} each
                  </div>
                </div>

                <CopyButton text={`$${result.total.toFixed(2)} ($${result.perPerson.toFixed(2)}/person)`} />
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
