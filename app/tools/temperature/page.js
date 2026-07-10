'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const scales = ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine'];

const convert = {
  'Celsius->Fahrenheit': (v) => (v * 9) / 5 + 32,
  'Celsius->Kelvin': (v) => v + 273.15,
  'Celsius->Rankine': (v) => (v + 273.15) * 9 / 5,
  'Fahrenheit->Celsius': (v) => (v - 32) * 5 / 9,
  'Fahrenheit->Kelvin': (v) => (v - 32) * 5 / 9 + 273.15,
  'Fahrenheit->Rankine': (v) => v + 459.67,
  'Kelvin->Celsius': (v) => v - 273.15,
  'Kelvin->Fahrenheit': (v) => (v - 273.15) * 9 / 5 + 32,
  'Kelvin->Rankine': (v) => v * 9 / 5,
  'Rankine->Celsius': (v) => (v - 491.67) * 5 / 9,
  'Rankine->Fahrenheit': (v) => v - 459.67,
  'Rankine->Kelvin': (v) => v * 5 / 9,
};

const symbols = { Celsius: '°C', Fahrenheit: '°F', Kelvin: 'K', Rankine: '°R' };

const comparisonPoints = [
  { label: 'Absolute Zero', values: { Celsius: -273.15, Fahrenheit: -459.67, Kelvin: 0, Rankine: 0 } },
  { label: 'Water Freezes', values: { Celsius: 0, Fahrenheit: 32, Kelvin: 273.15, Rankine: 491.67 } },
  { label: 'Room Temp', values: { Celsius: 20, Fahrenheit: 68, Kelvin: 293.15, Rankine: 527.67 } },
  { label: 'Body Temp', values: { Celsius: 37, Fahrenheit: 98.6, Kelvin: 310.15, Rankine: 558.27 } },
  { label: 'Water Boils', values: { Celsius: 100, Fahrenheit: 212, Kelvin: 373.15, Rankine: 671.67 } },
];

export default function TemperaturePage() {
  const { addEntry } = useHistory();
  const [from, setFrom] = useState('Celsius');
  const [to, setTo] = useState('Fahrenheit');
  const [value, setValue] = useState('100');

  const handleConvert = useCallback((v, f, t) => {
    if (v === '' || isNaN(parseFloat(v))) return '';
    const num = parseFloat(v);
    if (f === t) return num;
    const key = `${f}->${t}`;
    if (!convert[key]) return '';
    const result = convert[key](num);
    return parseFloat(result.toFixed(4));
  }, []);

  const result = handleConvert(value, from, to);

  const allConversions = scales.filter(s => s !== from).map(s => ({
    scale: s,
    value: handleConvert(value, from, s),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">°</span>
        <h1 className="font-heading text-2xl font-bold text-text">Temperature Converter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">From</label>
                <select value={from} onChange={e => { setFrom(e.target.value); setValue(''); }}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {scales.map(s => <option key={s} value={s}>{s} ({symbols[s]})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">To</label>
                <select value={to} onChange={e => setTo(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {scales.filter(s => s !== from).map(s => <option key={s} value={s}>{s} ({symbols[s]})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Value</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Result</span>
                {result !== '' && <CopyButton text={String(result)} />}
              </div>
              <div className="text-2xl font-mono text-text font-bold">
                {result !== ''
                  ? `${result} ${symbols[to]}`
                  : <span className="text-text-tertiary text-sm">Enter a value</span>
                }
              </div>
            </div>
          </GlassCard>

          {value && result !== '' && (
            <GlassCard>
              <div className="p-4">
                <span className="text-xs text-text-tertiary mb-3 block">All conversions</span>
                <div className="space-y-2">
                  {allConversions.map(({ scale, value: v }) => (
                    <div key={scale} className="flex justify-between items-center bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <span className="text-xs text-text-tertiary">{symbols[scale]}</span>
                      <span className="text-sm font-mono text-text">{typeof v === 'number' ? v : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <GlassCard className="mt-5">
        <div className="p-4">
          <span className="text-xs text-text-tertiary mb-3 block">Reference Points</span>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-tertiary border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium">Point</th>
                  {scales.map(s => <th key={s} className="text-right py-2 px-2 font-medium">{symbols[s]}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparisonPoints.map(({ label, values }) => (
                  <tr key={label} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-3 text-text font-medium">{label}</td>
                    {scales.map(s => (
                      <td key={s} className="text-right py-2 px-2 text-text-secondary font-mono text-xs">{values[s]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
