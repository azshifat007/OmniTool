'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function evaluate(expr) {
  try {
    let s = expr
      .replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(').replace(/√\(/g, 'Math.sqrt(')
      .replace(/π/g, 'Math.PI').replace(/e(?![xp])/g, 'Math.E')
      .replace(/²/g, '**2').replace(/³/g, '**3').replace(/!/g, 'factorial');
    while (s.includes('factorial')) {
      s = s.replace(/(\d+)factorial/, (_, n) => {
        let r = 1; for (let i = 2; i <= +n; i++) r *= i; return r;
      });
    }
    return Function('"use strict"; return (' + s + ')')();
  } catch { return null; }
}

const btns = [
  { l: '(',  v: '(' }, { l: ')', v: ')' }, { l: 'C', v: 'clear' }, { l: '⌫', v: 'back' },
  { l: 'sin', v: 'sin(' }, { l: 'cos', v: 'cos(' }, { l: 'tan', v: 'tan(' }, { l: '÷', v: '/' },
  { l: '7', v: '7' }, { l: '8', v: '8' }, { l: '9', v: '9' }, { l: '×', v: '*' },
  { l: '4', v: '4' }, { l: '5', v: '5' }, { l: '6', v: '6' }, { l: '−', v: '-' },
  { l: '1', v: '1' }, { l: '2', v: '2' }, { l: '3', v: '3' }, { l: '+', v: '+' },
  { l: '0', v: '0' }, { l: '.', v: '.' }, { l: '=', v: 'eval' }, { l: 'x²', v: '²' },
  { l: 'log', v: 'log(' }, { l: 'ln', v: 'ln(' }, { l: '√', v: '√(' }, { l: 'x!', v: '!' },
];

export default function SciCalcPage() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(false);

  const click = useCallback((val) => {
    if (val === 'clear') { setExpr(''); setResult(''); setError(false); return; }
    if (val === 'back') { setExpr(p => p.slice(0, -1)); return; }
    if (val === 'eval') {
      const r = evaluate(expr);
      setResult(r !== null ? r : 'Error');
      setError(r === null);
      return;
    }
    setExpr(p => p + val);
    setError(false);
  }, [expr]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">√</span>
        <h1 className="font-heading text-2xl font-bold text-text">Scientific Calculator</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-3">
          <div className="bg-surface rounded-xl border border-border px-4 py-3 min-h-[72px]">
            <div className="text-sm text-text-tertiary font-mono break-all min-h-[20px]">{expr || '\u00A0'}</div>
            <div className={`text-2xl font-bold font-mono break-all ${error ? 'text-cat-text' : 'text-text'}`}>{result || '\u00A0'}</div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {btns.map(b => (
              <button key={b.v} onClick={() => click(b.v)}
                className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  b.v === 'eval' ? 'bg-primary text-white hover:bg-primary-dark' :
                  b.v === 'clear' || b.v === 'back' ? 'bg-cat-text/10 text-cat-text hover:bg-cat-text/20' :
                  /^[a-z√]/.test(b.v) ? 'bg-surface text-text-secondary border border-border hover:border-primary/40' :
                  'bg-surface text-text border border-border hover:border-primary/40'
                }`}>
                {b.l}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
