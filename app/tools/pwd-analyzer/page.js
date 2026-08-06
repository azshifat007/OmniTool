'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

function analyze(pwd) {
  let score = 0;
  const feedback = [];
  if (pwd.length >= 8) { score += 20; } else { feedback.push('Use at least 8 characters.'); }
  if (pwd.length >= 12) score += 10;
  if (pwd.length >= 16) score += 10;
  if (/[a-z]/.test(pwd)) { score += 10; } else { feedback.push('Add lowercase letters.'); }
  if (/[A-Z]/.test(pwd)) { score += 10; } else { feedback.push('Add uppercase letters.'); }
  if (/\d/.test(pwd)) { score += 10; } else { feedback.push('Add numbers.'); }
  if (/[^a-zA-Z0-9]/.test(pwd)) { score += 15; } else { feedback.push('Add symbols.'); }
  if (/(.)\1{2,}/.test(pwd)) { score -= 10; feedback.push('Avoid repeated characters.'); }
  if (/^(password|123456|qwerty|letmein|admin)$/i.test(pwd)) { score = 5; feedback.push('This is a commonly used password.'); }
  const entropy = pwd.length * (Math.log2(26 * (/[a-z]/.test(pwd) ? 1 : 0) + 26 * (/[A-Z]/.test(pwd) ? 1 : 0) + 10 * (/\d/.test(pwd) ? 1 : 0) + 32 * (/[^a-zA-Z0-9]/.test(pwd) ? 1 : 0)) || 1);
  const label = score >= 90 ? 'Very Strong' : score >= 70 ? 'Strong' : score >= 50 ? 'Good' : score >= 30 ? 'Weak' : 'Very Weak';
  const color = score >= 90 ? 'bg-cat-success' : score >= 70 ? 'bg-cat-code' : score >= 50 ? 'bg-cat-document' : score >= 30 ? 'bg-cat-media' : 'bg-cat-text';
  return { score: Math.min(100, score), label, color, entropy: Math.round(entropy), feedback };
}

export default function PwdAnalyzerPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const result = analyze(input);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-security">⚷</span>
        <h1 className="font-heading text-2xl font-bold text-text">Password Strength Analyzer</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="relative">
            <label className="text-xs text-text-tertiary mb-2 block">Enter Password</label>
            <input type={show ? 'text' : 'password'} value={input} onChange={(e) => { setInput(e.target.value); addEntry('Password Strength Analyzer'); }}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors pr-10" placeholder="Type a password..." />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-8 text-text-tertiary hover:text-text text-sm cursor-pointer">
              {show ? '🙈' : '👁'}
            </button>
          </div>
          {input && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-tertiary">Strength</span>
                  <span className={`text-xs font-semibold ${result.color.replace('bg-', 'text-')}`}>{result.label}</span>
                </div>
                <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }} className={`h-full rounded-full ${result.color}`} />
                </div>
              </div>
              <div className="flex gap-4 text-xs text-text-secondary">
                <span>Score: {result.score}/100</span>
                <span>Entropy: ~{result.entropy} bits</span>
                <span>Length: {input.length} chars</span>
              </div>
              {result.feedback.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-text-tertiary">Suggestions</span>
                  {result.feedback.map((f, i) => (
                    <div key={i} className="text-xs text-cat-text bg-cat-text/10 rounded-lg px-3 py-1.5 border border-cat-text/20">{f}</div>
                  ))}
                </div>
              )}
              {result.feedback.length === 0 && input.length > 0 && (
                <div className="text-xs text-cat-success bg-cat-success/10 rounded-lg px-3 py-1.5 border border-cat-success/20">Excellent password!</div>
              )}
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
