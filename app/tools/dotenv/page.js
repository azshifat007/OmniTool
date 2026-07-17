'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseEnv(text) {
  const lines = text.split('\n');
  const entries = [];
  let error = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) { error = `Line ${i + 1}: no equals sign`; continue; }
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('"') || val.startsWith("'")) {
      error = `Line ${i + 1}: unclosed quote`;
    }

    if (key) entries.push({ key, value: val, line: i + 1 });
  }

  return { entries, error };
}

function toJson(entries) {
  const obj = {};
  entries.forEach((e) => { obj[e.key] = e.value; });
  return JSON.stringify(obj, null, 2);
}

function toYaml(entries) {
  return entries.map((e) => `${e.key}: "${e.value.replace(/"/g, '\\"')}"`).join('\n');
}

function toEnv(entries) {
  return entries.map((e) => `${e.key}=${e.value}`).join('\n');
}

const samples = [
  'Simple',
  'With Quotes',
  'Comments',
];

const sampleTexts = [
  'DATABASE_URL=postgres://localhost:5432/mydb\nPORT=3000\nNODE_ENV=development\nDEBUG=true',
  'APP_NAME="My Awesome App"\nAPP_VERSION=\'1.2.3\'\nGREETING="Hello, World!"\nDB_PASS="p@ssw0rd!"',
  '# Database config\nDB_HOST=localhost\nDB_PORT=5432\n\n# App config\nAPP_PORT=3000\nAPP_SECRET=supersecret',
];

export default function DotenvPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('json');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: '' };
    addEntry('Dotenv Parser');
    const result = parseEnv(input);
    return { parsed: result.entries, error: result.error || '' };
  }, [input, addEntry]);

  const resultText = parsed
    ? output === 'json' ? toJson(parsed) : output === 'yaml' ? toYaml(parsed) : toEnv(parsed)
    : '';

  const addEntry2 = () => {
    if (!newKey.trim()) return;
    const line = newVal.includes(' ') || newVal.includes('#') ? `${newKey.trim()}="${newVal}"` : `${newKey.trim()}=${newVal}`;
    setInput(prev => prev ? `${prev}\n${line}` : line);
    setNewKey(''); setNewVal('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">.env</span>
        <h1 className="font-heading text-2xl font-bold text-text">Dotenv Parser</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <label className="text-xs text-text-tertiary">Input (.env)</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} placeholder="KEY=VALUE"
              className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <div className="flex flex-wrap gap-2">
              {samples.map((name, i) => (
                <button key={name} onClick={() => setInput(sampleTexts[i])}
                  className="text-[10px] px-2 py-1 rounded bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{name}</button>
              ))}
            </div>
            <div className="bg-surface rounded-lg p-2 border border-border/50 space-y-2">
              <div className="text-[10px] text-text-tertiary">Add Key</div>
              <div className="flex gap-2">
                <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="KEY"
                  className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-[11px] font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="value"
                  className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-[11px] font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={addEntry2} className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">Add</button>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          {parsed && (
            <>
              <GlassCard>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-tertiary">Entries</span>
                    <span className="text-[10px] text-text-secondary">{parsed.length} keys</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {parsed.map((e) => (
                      <div key={e.key} className="bg-surface rounded-lg px-3 py-2 border border-border">
                        <div className="text-xs font-mono text-text font-semibold">{e.key}</div>
                        <div className="text-[10px] font-mono text-text-secondary break-all">{e.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      {[['json', 'JSON'], ['yaml', 'YAML'], ['env', '.env']].map(([v, l]) => (
                        <button key={v} onClick={() => setOutput(v)}
                          className={`px-2 py-1 text-[10px] font-medium rounded transition-all cursor-pointer ${output === v ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border'}`}>{l}</button>
                      ))}
                    </div>
                    <CopyButton text={resultText} />
                  </div>
                  <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border whitespace-pre-wrap break-all max-h-48 overflow-y-auto">{resultText}</pre>
                </div>
              </GlassCard>
            </>
          )}

          {!parsed && input && <div className="text-xs text-text-tertiary">No valid keys found.</div>}
          {error && <div className="text-xs text-cat-text">{error}</div>}
        </div>
      </div>
    </motion.div>
  );
}
