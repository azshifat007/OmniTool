'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const buttons = [
  ['C', 'CE', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '='],
];

function evalExpression(expr) {
  try {
    const sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');
    const result = Function('"use strict"; return (' + sanitized + ')')();
    if (!isFinite(result)) return 'Error';
    return parseFloat(result.toFixed(10));
  } catch {
    return 'Error';
  }
}

export default function CalculatorPage() {
  const { addEntry } = useHistory();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([]);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [memory, setMemory] = useState(0);
  const [memSet, setMemSet] = useState(false);

  const handleButton = useCallback((btn) => {
    switch (btn) {
      case 'C':
        setDisplay('0');
        setExpression('');
        setJustEvaluated(false);
        break;
      case 'CE':
        setDisplay('0');
        setJustEvaluated(false);
        break;
      case '=': {
        if (!expression && display === '0') break;
        const expr = expression || display;
        const result = evalExpression(expr);
        if (result === 'Error') {
          setDisplay('Error');
          setExpression('');
        } else {
          const entry = `${expr} = ${result}`;
          setHistory((h) => [entry, ...h].slice(0, 20));
          setDisplay(String(result));
          setExpression(String(result));
          addEntry('Calculator');
        }
        setJustEvaluated(true);
        break;
      }
      case '±': {
        if (display === '0') break;
        const neg = display.startsWith('-') ? display.slice(1) : '-' + display;
        setDisplay(neg);
        setExpression(neg);
        break;
      }
      case '%':
      case '+':
      case '−':
      case '×':
      case '÷': {
        if (justEvaluated) {
          setExpression(display + btn);
          setDisplay(btn);
          setJustEvaluated(false);
        } else {
          const newExpr = expression + display + btn;
          setExpression(newExpr);
          setDisplay(btn);
        }
        break;
      }
      case '.':
        if (justEvaluated) {
          setDisplay('0.');
          setExpression('0.');
          setJustEvaluated(false);
        } else if (!display.includes('.')) {
          setDisplay(display + '.');
        }
        break;
      default: {
        if (justEvaluated) {
          setDisplay(btn);
          setExpression('');
          setJustEvaluated(false);
        } else {
          setDisplay(display === '0' ? btn : display + btn);
        }
      }
    }
  }, [display, expression, justEvaluated, addEntry]);

  const handleMemory = useCallback((action) => {
    const val = parseFloat(display) || 0;
    if (action === 'MC') { setMemory(0); setMemSet(false); }
    else if (action === 'M+') { setMemory(m => m + val); setMemSet(true); }
    else if (action === 'M-') { setMemory(m => m - val); setMemSet(true); }
    else if (action === 'MR') { setDisplay(String(memory)); setExpression(String(memory)); setJustEvaluated(true); }
  }, [display, memory]);

  const handleKeyDown = useCallback((e) => {
    const keyMap = {
      Enter: '=', Backspace: 'C',
      '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%', '.': '.',
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    };
    if (e.key === 'Backspace') {
      if (display.length > 1) setDisplay(display.slice(0, -1));
      else setDisplay('0');
      return;
    }
    if (e.key === 'Escape') {
      setDisplay('0'); setExpression(''); setJustEvaluated(false);
      return;
    }
    const mapped = keyMap[e.key];
    if (mapped) {
      e.preventDefault();
      handleButton(mapped);
    }
  }, [handleButton, display]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const displayValue = expression
    ? expression + ' ' + (display.match(/[+\-×÷%]/) ? '' : display)
    : display;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-math">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="bg-surface rounded-xl border border-border p-4 mb-4 text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-mono">{memSet ? `M: ${memory}` : ' '}</span>
                <button onClick={() => navigator.clipboard.writeText(display)} className="text-[10px] text-text-tertiary hover:text-primary cursor-pointer">Copy</button>
              </div>
              <div className="text-xs text-text-tertiary font-mono min-h-[1.2em] break-all">
                {expression || '\u00A0'}
              </div>
              <div className="text-3xl font-mono text-text font-bold mt-1 break-all">
                {display}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {['MC', 'M+', 'M-', 'MR'].map((m) => (
                <button key={m} onClick={() => handleMemory(m)}
                  className="py-2 rounded-xl text-xs font-medium bg-surface text-cat-math border border-border hover:border-primary/40 transition-all cursor-pointer">
                  {m}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {buttons.map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-2">
                  {row.map((btn) => {
                    const isOp = ['+', '−', '×', '÷', '%', '='].includes(btn);
                    const isClear = ['C', 'CE'].includes(btn);
                    const isEqual = btn === '=';
                    return (
                      <button key={btn} onClick={() => handleButton(btn)}
                        className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          isEqual
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : isOp
                              ? 'bg-surface text-primary border border-border hover:border-primary/40'
                              : isClear
                                ? 'bg-surface text-cat-text border border-border hover:border-cat-text/40'
                                : 'bg-surface text-text border border-border hover:border-primary/40 hover:text-text'
                        }`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">History</span>
              {history.length > 0 && (
                <button onClick={() => setHistory([])}
                  className="text-xs text-text-tertiary hover:text-cat-text transition-colors cursor-pointer">Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-sm text-text-tertiary">No calculations yet</div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {history.map((entry, i) => (
                  <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border/50">
                    {entry}
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
