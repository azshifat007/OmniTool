'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function formatGraphQL(query) {
  let depth = 0;
  const lines = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < query.length; i++) {
    const ch = query[i];
    if (inString) {
      current += ch;
      if (ch === stringChar && query[i - 1] !== '\\') inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }
    if (ch === '{') {
      if (current.trim()) lines.push('  '.repeat(depth) + current.trim());
      lines.push('  '.repeat(depth) + '{');
      current = '';
      depth++;
    } else if (ch === '}') {
      if (current.trim()) lines.push('  '.repeat(depth) + current.trim());
      depth--;
      lines.push('  '.repeat(depth) + '}');
      current = '';
    } else if (ch === '(') {
      let parens = 1;
      let argStr = '(';
      i++;
      while (i < query.length && parens > 0) {
        if (query[i] === '(') parens++;
        if (query[i] === ')') parens--;
        if (parens > 0) argStr += query[i];
        i++;
      }
      argStr += ')';
      current += argStr;
    } else if (ch === '\n' || ch === '\r') {
      if (current.trim()) {
        lines.push('  '.repeat(depth) + current.trim());
        current = '';
      }
    } else if (ch === '#') {
      let comment = '#';
      i++;
      while (i < query.length && query[i] !== '\n') { comment += query[i]; i++; }
      lines.push('  '.repeat(depth) + comment);
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push('  '.repeat(depth) + current.trim());
  return lines.join('\n');
}

const EXAMPLE = `query getUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts(limit: 10) {
      title
      content
      comments {
        body
        author {
          name
        }
      }
    }
  }
}`;

export default function GraphqlPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE);
  const [output, setOutput] = useState('');

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = formatGraphQL(input);
    setOutput(result);
    addEntry('GraphQL Formatter');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⚡</span>
        <h1 className="font-heading text-2xl font-bold text-text">GraphQL Formatter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">GraphQL Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your GraphQL query here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-tertiary">{input.length} characters</span>
              <button onClick={handleFormat}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Format</button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-text-tertiary">Formatted</label>
              <div className="flex items-center gap-2">
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea value={output} readOnly
              placeholder="Formatted query will appear here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none" />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
