'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'ORDER BY', 'GROUP BY', 'HAVING',
  'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
  'AND', 'OR', 'IN', 'AS', 'ON', 'LIMIT', 'SET', 'VALUES', 'INTO',
  'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
  'UNION', 'ALL', 'DISTINCT', 'EXISTS', 'NOT', 'NULL', 'IS', 'BETWEEN', 'LIKE', 'ASC', 'DESC',
]);

const CLAUSE_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
  'INSERT INTO', 'UPDATE', 'DELETE FROM', 'SET', 'VALUES',
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'ON', 'LIMIT', 'UNION', 'UNION ALL',
];

const EXAMPLE_SQL = `SELECT u.id, u.name, u.email, count(o.id) as order_count
from users u
left join orders o on u.id = o.user_id
where u.active = 1 and o.created_at >= '2024-01-01'
group by u.id, u.name, u.email
having count(o.id) > 5
order by order_count desc limit 20`;

function formatSql(sql) {
  let upper = sql.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const u = word.toUpperCase();
    return KEYWORDS.has(u) ? u : word;
  });

  for (const kw of CLAUSE_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    upper = upper.replace(regex, `\n${kw}`);
  }

  upper = upper.replace(/^\n+/, '');
  const lines = upper.split('\n');
  const indented = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    const u = trimmed.split(/\s+/)[0].toUpperCase();
    if (u === 'SELECT' || u === 'INSERT' || u === 'UPDATE' || u === 'DELETE') return trimmed;
    if (['FROM', 'WHERE', 'ORDER', 'GROUP', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'LIMIT', 'UNION', 'VALUES', 'SET'].includes(u)) return `  ${trimmed}`;
    return `    ${trimmed}`;
  });

  return indented.join('\n').replace(/ +\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export default function SqlFormatterPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_SQL);
  const [output, setOutput] = useState('');

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = formatSql(input);
    setOutput(result);
    addEntry('SQL Formatter');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⌨</span>
        <h1 className="font-heading text-2xl font-bold text-text">SQL Formatter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">SQL Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SQL here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-tertiary">{input.length} characters</span>
              <button onClick={handleFormat} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                Format
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-text-tertiary">Formatted SQL</label>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    {input.length > 0 && (
                      <span className="text-xs text-text-tertiary">
                        {output.length - input.length > 0 ? '+' : ''}{output.length - input.length} chars
                      </span>
                    )}
                    <CopyButton text={output} />
                  </>
                )}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted SQL will appear here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
            />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
