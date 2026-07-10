'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function xmlToJson(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const errors = doc.querySelectorAll('parsererror');
  if (errors.length > 0) throw new Error(errors[0].textContent);
  function walk(node) {
    if (node.nodeType === 3) return node.textContent.trim();
    const obj = {};
    const attrs = {};
    if (node.attributes) {
      for (const attr of node.attributes) attrs[attr.name] = attr.value;
    }
    if (Object.keys(attrs).length > 0) obj['@attributes'] = attrs;
    const children = [];
    for (const child of node.childNodes) {
      const val = walk(child);
      if (val !== '') children.push(val);
    }
    if (children.length === 1 && typeof children[0] === 'string' && !obj['@attributes']) return children[0];
    if (children.length > 0) obj['#content'] = children.length === 1 ? children[0] : children;
    return obj;
  }
  const result = {};
  result[doc.documentElement.tagName] = walk(doc.documentElement);
  return JSON.stringify(result, null, 2);
}

function jsonToXml(jsonStr) {
  let obj;
  try { obj = JSON.parse(jsonStr); } catch { throw new Error('Invalid JSON'); }
  function build(obj, name) {
    if (obj === null || obj === undefined) return '';
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      const escaped = String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      return `<${name}>${escaped}</${name}>`;
    }
    if (Array.isArray(obj)) return obj.map(item => build(item, name)).join('\n');
    let attrs = '';
    let content = '';
    if (obj['@attributes']) {
      for (const [k, v] of Object.entries(obj['@attributes'])) attrs += ` ${k}="${v}"`;
    }
    if (obj['#content'] !== undefined) {
      const c = obj['#content'];
      if (Array.isArray(c)) content = c.map(item => {
        if (typeof item === 'object') return Object.entries(item).map(([k, v]) => build(v, k)).join('\n');
        const escaped = String(item).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return escaped;
      }).join('\n');
      else if (typeof c === 'object') content = Object.entries(c).map(([k, v]) => build(v, k)).join('\n');
      else content = String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
      const entries = Object.entries(obj).filter(([k]) => k !== '@attributes');
      content = entries.map(([k, v]) => build(v, k)).join('\n');
    }
    if (!content) return `<${name}${attrs} />`;
    return `<${name}${attrs}>\n${content.split('\n').map(l => '  ' + l).join('\n')}\n</${name}>`;
  }
  const keys = Object.keys(obj);
  if (keys.length !== 1) throw new Error('JSON must have a single root key');
  return build(obj[keys[0]], keys[0]);
}

export default function XmlToJsonPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('xml2json');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [raw, setRaw] = useState(false);

  const convert = useCallback(() => {
    setError(''); setOutput('');
    if (!input.trim()) return;
    addEntry('XML to JSON');
    try {
      const result = mode === 'xml2json' ? xmlToJson(input) : jsonToXml(input);
      setOutput(result);
    } catch (e) {
      setError(e.message);
    }
  }, [input, mode, addEntry]);

  const sampleXml = '<root><person id="1"><name>John</name><age>30</age></person></root>';
  const sampleJson = '{\n  "root": {\n    "person": {\n      "@attributes": { "id": "1" },\n      "name": "John",\n      "age": 30\n    }\n  }\n}';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇄</span>
        <h1 className="font-heading text-2xl font-bold text-text">XML to JSON</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-surface rounded-lg border border-border p-0.5">
              <button onClick={() => setMode('xml2json')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${mode === 'xml2json' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text'}`}>XML → JSON</button>
              <button onClick={() => setMode('json2xml')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${mode === 'json2xml' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text'}`}>JSON → XML</button>
            </div>
            <button onClick={() => setInput(mode === 'xml2json' ? sampleXml : sampleJson)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-text transition-all cursor-pointer">Load Sample</button>
          </div>

          <div>
            <label className="text-xs text-text-tertiary mb-2 block">{mode === 'xml2json' ? 'XML Input' : 'JSON Input'}</label>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={mode === 'xml2json' ? 'Paste XML here...' : 'Paste JSON here...'}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors min-h-[160px] resize-y" />
          </div>

          <label className="flex items-center gap-2 text-xs text-text-tertiary cursor-pointer">
            <input type="checkbox" checked={raw} onChange={e => setRaw(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer" />
            Pretty print (JSON only)
          </label>

          <button onClick={convert} disabled={!input.trim()}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-all cursor-pointer">
            Convert
          </button>
        </div>
      </GlassCard>

      {output && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Output</span>
              <CopyButton text={output} />
            </div>
            <pre className="text-xs font-mono text-text bg-surface rounded-lg p-3 border border-border/50 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all">{output}</pre>
          </div>
        </GlassCard>
      )}

      {error && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>
      )}
    </motion.div>
  );
}
