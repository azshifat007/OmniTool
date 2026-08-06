'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';
import { converterFns } from '@/lib/converters';

export default function ConverterPage() {
  const { addEntry } = useHistory();
  const [mode, setMode] = useState('json-to-yaml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    setError('');
    try {
      const result = converterFns[mode].fn(input);
      setOutput(result);
      addEntry(`Converter: ${mode}`);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [mode, input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇄</span>
        <h1 className="font-heading text-2xl font-bold text-text">Universal Converter</h1>
      </div>

      <div className="mb-4">
        <GlassCard>
          <div className="p-3">
            <select
              value={mode}
              onChange={(e) => { setMode(e.target.value); setInput(''); setOutput(''); setError(''); }}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors"
            >
              <option value="json-to-yaml">JSON → YAML</option>
              <option value="yaml-to-json">YAML → JSON</option>
              <option value="encode-base64">Encode Base64</option>
              <option value="decode-base64">Decode Base64</option>
              <option value="encode-url">Encode URL</option>
              <option value="decode-url">Decode URL</option>
            </select>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">{converterFns[mode].inputLabel}</span>
              <CopyButton text={input} />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder={`Enter ${converterFns[mode].inputLabel} here...`}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">{converterFns[mode].outputLabel}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConvert}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer"
                >
                  Convert
                </button>
                {output && <CopyButton text={output} />}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
              placeholder="Output will appear here..."
            />
          </div>
        </GlassCard>
      </div>

      {error && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">
          {error}
        </div>
      )}
    </motion.div>
  );
}
