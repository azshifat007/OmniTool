'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jsonToCsv(json) {
  if (!Array.isArray(json) || json.length === 0) {
    throw new Error('Input must be a non-empty array of objects');
  }
  const keys = Object.keys(json[0]);
  const header = keys.map(escapeCsv).join(',');
  const rows = json.map(row => keys.map(k => escapeCsv(row[k])).join(','));
  return [header, ...rows].join('\n');
}

function csvToJson(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]);
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
    result.push(obj);
  }
  return result;
}

export default function JsonCsvPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState('json2csv');
  const [error, setError] = useState('');

  const handleConvert = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      let result;
      if (direction === 'json2csv') {
        const parsed = JSON.parse(input);
        result = jsonToCsv(parsed);
      } else {
        result = JSON.stringify(csvToJson(input), null, 2);
      }
      setOutput(result);
      addEntry('JSON ↔ CSV');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, direction, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">{'{ }'}</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON ↔ CSV</h1>
      </div>

      <GlassCard>
        <div className="p-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Direction:</span>
            <label className="flex items-center gap-1.5 text-xs text-text cursor-pointer">
              <input type="radio" name="dir" value="json2csv" checked={direction === 'json2csv'}
                onChange={(e) => { setDirection(e.target.value); setOutput(''); setError(''); }}
                className="accent-primary" />
              JSON → CSV
            </label>
            <label className="flex items-center gap-1.5 text-xs text-text cursor-pointer">
              <input type="radio" name="dir" value="csv2json" checked={direction === 'csv2json'}
                onChange={(e) => { setDirection(e.target.value); setOutput(''); setError(''); }}
                className="accent-primary" />
              CSV → JSON
            </label>
          </div>
          <button onClick={handleConvert} className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer ml-auto">Convert</button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={direction === 'json2csv' ? '[{"key": "value"}, ...]' : 'key,value\nhello,world'} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Output</span>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Result will appear here..." />
          </div>
        </GlassCard>
      </div>
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
