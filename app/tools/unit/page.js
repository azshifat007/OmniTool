'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const categories = {
  Length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    base: 'm',
    toBase: {
      mm: (v) => v / 1000,
      cm: (v) => v / 100,
      m: (v) => v,
      km: (v) => v * 1000,
      in: (v) => v * 0.0254,
      ft: (v) => v * 0.3048,
      yd: (v) => v * 0.9144,
      mi: (v) => v * 1609.344,
    },
    fromBase: {
      mm: (v) => v * 1000,
      cm: (v) => v * 100,
      m: (v) => v,
      km: (v) => v / 1000,
      in: (v) => v / 0.0254,
      ft: (v) => v / 0.3048,
      yd: (v) => v / 0.9144,
      mi: (v) => v / 1609.344,
    },
  },
  Weight: {
    units: ['mg', 'g', 'kg', 'oz', 'lb', 'ton'],
    base: 'g',
    toBase: {
      mg: (v) => v / 1000,
      g: (v) => v,
      kg: (v) => v * 1000,
      oz: (v) => v * 28.3495,
      lb: (v) => v * 453.592,
      ton: (v) => v * 1000000,
    },
    fromBase: {
      mg: (v) => v * 1000,
      g: (v) => v,
      kg: (v) => v / 1000,
      oz: (v) => v / 28.3495,
      lb: (v) => v / 453.592,
      ton: (v) => v / 1000000,
    },
  },
  Temperature: {
    units: ['°C', '°F', 'K'],
    base: '°C',
    convert: {
      '°C->°F': (v) => (v * 9) / 5 + 32,
      '°C->K': (v) => v + 273.15,
      '°F->°C': (v) => ((v - 32) * 5) / 9,
      '°F->K': (v) => ((v - 32) * 5) / 9 + 273.15,
      'K->°C': (v) => v - 273.15,
      'K->°F': (v) => ((v - 273.15) * 9) / 5 + 32,
    },
  },
  Data: {
    units: ['B', 'KB', 'MB', 'GB', 'TB'],
    base: 'B',
    toBase: {
      B: (v) => v,
      KB: (v) => v * 1024,
      MB: (v) => v * 1024 * 1024,
      GB: (v) => v * 1024 * 1024 * 1024,
      TB: (v) => v * 1024 * 1024 * 1024 * 1024,
    },
    fromBase: {
      B: (v) => v,
      KB: (v) => v / 1024,
      MB: (v) => v / (1024 * 1024),
      GB: (v) => v / (1024 * 1024 * 1024),
      TB: (v) => v / (1024 * 1024 * 1024 * 1024),
    },
  },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'knot'],
    base: 'm/s',
    toBase: {
      'm/s': (v) => v,
      'km/h': (v) => v / 3.6,
      'mph': (v) => v * 0.44704,
      'knot': (v) => v * 0.514444,
    },
    fromBase: {
      'm/s': (v) => v,
      'km/h': (v) => v * 3.6,
      'mph': (v) => v / 0.44704,
      'knot': (v) => v / 0.514444,
    },
  },
};

function convert(cat, from, to, value) {
  const c = categories[cat];
  if (!c || isNaN(value) || value === '') return null;
  const v = parseFloat(value);
  if (cat === 'Temperature') {
    if (from === to) return v;
    const key = `${from}->${to}`;
    return c.convert[key] ? c.convert[key](v) : null;
  }
  if (from === to) return v;
  const baseVal = c.toBase[from](v);
  return c.fromBase[to](baseVal);
}

function getFormula(cat, from, to) {
  if (from === to) return '';
  const map = {
    'Length': { 'm->km': '÷ 1000', 'km->m': '× 1000', 'cm->m': '÷ 100', 'm->cm': '× 100', 'mm->m': '÷ 1000', 'm->mm': '× 1000', 'in->m': '× 0.0254', 'm->in': '÷ 0.0254', 'ft->m': '× 0.3048', 'm->ft': '÷ 0.3048', 'yd->m': '× 0.9144', 'm->yd': '÷ 0.9144', 'mi->m': '× 1609.344', 'm->mi': '÷ 1609.344' },
    'Weight': { 'g->kg': '÷ 1000', 'kg->g': '× 1000', 'mg->g': '÷ 1000', 'g->mg': '× 1000', 'oz->g': '× 28.3495', 'g->oz': '÷ 28.3495', 'lb->g': '× 453.592', 'g->lb': '÷ 453.592', 'ton->g': '× 1,000,000', 'g->ton': '÷ 1,000,000' },
    'Temperature': { '°C->°F': '(°C × 9/5) + 32', '°F->°C': '(°F − 32) × 5/9', '°C->K': '°C + 273.15', 'K->°C': 'K − 273.15', '°F->K': '(°F − 32) × 5/9 + 273.15', 'K->°F': '(K − 273.15) × 9/5 + 32' },
    'Data': { 'B->KB': '÷ 1024', 'KB->B': '× 1024', 'KB->MB': '÷ 1024', 'MB->KB': '× 1024', 'MB->GB': '÷ 1024', 'GB->MB': '× 1024', 'GB->TB': '÷ 1024', 'TB->GB': '× 1024', 'B->MB': '÷ 1,048,576', 'MB->B': '× 1,048,576' },
    'Speed': { 'm/s->km/h': '× 3.6', 'km/h->m/s': '÷ 3.6', 'm/s->mph': '÷ 2.23694', 'mph->m/s': '× 2.23694', 'm/s->knot': '÷ 1.94384', 'knot->m/s': '× 1.94384', 'km/h->mph': '÷ 1.60934', 'mph->km/h': '× 1.60934' },
  };
  return map[cat]?.[`${from}->${to}`] || '';
}

export default function UnitPage() {
  const { addEntry } = useHistory();
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [value, setValue] = useState('1');

  const cat = categories[category];
  const units = cat.units;

  const handleCategory = useCallback((c) => {
    setCategory(c);
    const u = categories[c].units;
    setFromUnit(u[0]);
    setToUnit(u.length > 1 ? u[1] : u[0]);
    setValue('1');
    addEntry('Unit Converter');
  }, [addEntry]);

  const result = convert(category, fromUnit, toUnit, value);
  const formula = getFormula(category, fromUnit, toUnit);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">◈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Unit Converter</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categories).map((c) => (
                <button key={c} onClick={() => handleCategory(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    category === c ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">From</label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">To</label>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-tertiary">Result</span>
            {result !== null && <CopyButton text={String(result)} />}
          </div>
          <div className="text-2xl font-mono text-text font-bold break-all">
            {result !== null
              ? `${parseFloat(result.toFixed(10))} ${toUnit}`
              : <span className="text-text-tertiary text-sm">Enter a valid number</span>
            }
          </div>
          {formula && result !== null && (
            <div className="text-xs text-text-secondary mt-2 font-mono">
              {formula}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
