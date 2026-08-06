'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const EXAMPLE_YAML = `# Server configuration
server:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: true
    cert_path: /etc/certs/server.crt
    key_path: /etc/certs/server.key

database:
  host: localhost
  port: 5432
  name: myapp_db
  pool:
    min: 2
    max: 10

features:
  - name: authentication
    enabled: true
    providers: [oauth, saml]
  - name: rate_limiting
    enabled: false
    max_requests: 100`;

export default function YamlPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState(EXAMPLE_YAML);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const withYaml = useCallback(async (fn) => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      const { load, dump } = await import('js-yaml');
      fn(load, dump);
    } catch (e) {
      const msg = e.message || String(e);
      const lineMatch = msg.match(/line (\d+)/i);
      setError(lineMatch ? `Line ${lineMatch[1]}: ${msg}` : msg);
      setOutput('');
    }
  }, [input]);

  const handleFormat = useCallback(() => {
    withYaml((load, dump) => {
      const obj = load(input);
      setOutput(dump(obj, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false }));
      addEntry('YAML Formatter');
    });
  }, [withYaml, addEntry]);

  const handleValidate = useCallback(() => {
    withYaml((load) => {
      load(input);
      setOutput('✓ Valid YAML');
      addEntry('YAML Formatter');
    });
  }, [withYaml, addEntry]);

  const handleYamlToJson = useCallback(() => {
    withYaml((load) => {
      const obj = load(input);
      setOutput(JSON.stringify(obj, null, 2));
      addEntry('YAML Formatter');
    });
  }, [withYaml, addEntry]);

  const handleJsonToYaml = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    setError('');
    try {
      const parsed = JSON.parse(input);
      import('js-yaml').then(({ dump }) => {
        setOutput(dump(parsed, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false }));
        addEntry('YAML Formatter');
      });
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
      setOutput('');
    }
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">[Y]</span>
        <h1 className="font-heading text-2xl font-bold text-text">YAML Formatter</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <label className="text-xs text-text-tertiary mb-3 block">YAML Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste YAML here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button onClick={handleFormat} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Format</button>
              <button onClick={handleValidate} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-tertiary hover:text-text hover:border-text transition-all cursor-pointer">Validate</button>
              <button onClick={handleYamlToJson} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-tertiary hover:text-text hover:border-text transition-all cursor-pointer">YAML → JSON</button>
              <button onClick={handleJsonToYaml} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-tertiary hover:text-text hover:border-text transition-all cursor-pointer">JSON → YAML</button>
              <span className="text-xs text-text-tertiary ml-auto">{input.length} chars</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-text-tertiary">Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-64 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border resize-none"
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
