'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const presets = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily', expr: '0 0 * * *' },
  { label: 'Weekly', expr: '0 0 * * 0' },
  { label: 'Monthly', expr: '0 0 1 * *' },
];

const fieldLabels = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];

function describeField(value, index) {
  if (value === '*') return 'every';
  if (value.includes(',')) return value.split(',').map(v => describeField(v, index)).join(', ');
  if (value.startsWith('*/')) {
    const n = parseInt(value.slice(2), 10);
    const unit = fieldLabels[index].toLowerCase();
    return `every ${n} ${unit}${n > 1 ? 's' : ''}`;
  }
  return `at ${value}`;
}

function describeExpression(parts) {
  return 'Runs ' + parts.slice(0, 5).map((v, i) => describeField(v, i)).join(', ') + '.';
}

function nextTimes(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) return [];
  const now = new Date();
  const results = [];
  let candidate = new Date(now);
  candidate.setSeconds(0, 0);

  for (let i = 0; i < 10000 && results.length < 5; i++) {
    candidate.setMinutes(candidate.getMinutes() + 1);

    const m = candidate.getMinutes();
    const h = candidate.getHours();
    const d = candidate.getDate();
    const M = candidate.getMonth() + 1;
    const w = candidate.getDay();

    if (!matchField(parts[0], m)) continue;
    if (!matchField(parts[1], h)) continue;
    if (!matchField(parts[2], d)) continue;
    if (!matchField(parts[3], M)) continue;
    if (!matchField(parts[4], w)) continue;

    results.push(new Date(candidate));
  }
  return results;
}

function matchField(pattern, value) {
  if (pattern === '*') return true;
  if (pattern.startsWith('*/')) {
    const n = parseInt(pattern.slice(2), 10);
    return n > 0 && value % n === 0;
  }
  if (pattern.includes(',')) {
    return pattern.split(',').some(p => matchField(p.trim(), value));
  }
  const range = pattern.split('-');
  if (range.length === 2) {
    return value >= parseInt(range[0], 10) && value <= parseInt(range[1], 10);
  }
  return parseInt(pattern, 10) === value;
}

export default function CronPage() {
  const { addEntry } = useHistory();
  const [expression, setExpression] = useState('* * * * *');
  const [fields, setFields] = useState(null);
  const [next, setNext] = useState([]);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const parse = useCallback((expr) => {
    setError('');
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      setError('Enter a valid 5 or 6 field cron expression.');
      setFields(null);
      setNext([]);
      return;
    }
    const desc = parts.slice(0, 5).map((v, i) => ({
      value: v,
      label: fieldLabels[i],
      desc: describeField(v, i),
    }));
    setFields(desc);
    setNext(nextTimes(expr));
  }, []);

  const handleParse = useCallback(() => {
    parse(expression);
    addEntry('Cron Parser');
  }, [expression, parse, addEntry]);

  const handleChange = useCallback((e) => {
    const expr = e.target.value;
    setExpression(expr);
    setTouched(true);
    parse(expr);
  }, [parse]);

  const applyPreset = useCallback((expr) => {
    setExpression(expr);
    setTouched(true);
    setError('');
    parse(expr);
  }, [parse]);

  useEffect(() => {
    parse(expression);
  }, [parse, expression]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⏰</span>
        <h1 className="font-heading text-2xl font-bold text-text">Cron Parser</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-3 block">Cron Expression</label>
          <div className="flex gap-2">
            <input value={expression} onChange={handleChange} placeholder="* * * * *"
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={handleParse} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Parse</button>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2 mt-4 mb-5">
        {presets.map((p) => (
          <button key={p.expr} onClick={() => applyPreset(p.expr)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              expression === p.expr ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
            }`}
          >{p.label}</button>
        ))}
      </div>

      {fields && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Summary</span>
                <CopyButton text={describeExpression(expression.trim().split(/\s+/))} />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed capitalize">
                {describeExpression(expression.trim().split(/\s+/))}
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">Field Breakdown</span>
                <CopyButton text={expression} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-text-tertiary border-b border-border">
                      <th className="text-left py-2 pr-3 font-medium">Field</th>
                      <th className="text-left py-2 pr-3 font-medium">Value</th>
                      <th className="text-left py-2 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((f) => (
                      <tr key={f.label} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 text-text-secondary font-mono">{f.label}</td>
                        <td className="py-2 pr-3 text-text font-mono">{f.value}</td>
                        <td className="py-2 text-text">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Next 5 Execution Times</span>
              {next.length > 0 ? (
                <div className="space-y-2">
                  {next.map((d, i) => (
                    <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border/50">
                      {d.toLocaleString('en-US', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-text-secondary text-sm">No upcoming times found</span>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
