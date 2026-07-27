'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function validateSchema(data, schema, path = '') {
  const errors = [];
  if (!schema || typeof schema !== 'object') return errors;

  if (schema.type) {
    const actual = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    if (schema.type === 'integer') {
      if (actual !== 'number' || !Number.isInteger(data)) {
        errors.push({ path: path || 'root', message: `Expected integer, got ${actual}` });
      }
    } else if (schema.type !== actual) {
      errors.push({ path: path || 'root', message: `Expected ${schema.type}, got ${actual}` });
    }
  }

  if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in data)) errors.push({ path: path ? `${path}.${key}` : key, message: `Required property missing` });
      }
    }
    for (const [key, val] of Object.entries(data)) {
      if (schema.properties[key]) {
        errors.push(...validateSchema(val, schema.properties[key], path ? `${path}.${key}` : key));
      } else if (schema.additionalProperties === false) {
        errors.push({ path: path ? `${path}.${key}` : key, message: `Additional property not allowed` });
      }
    }
  }

  if (Array.isArray(data) && schema.items) {
    data.forEach((item, i) => {
      errors.push(...validateSchema(item, schema.items, `${path}[${i}]`));
    });
  }

  if (schema.minLength !== undefined && typeof data === 'string' && data.length < schema.minLength) {
    errors.push({ path: path || 'root', message: `Min length is ${schema.minLength}, got ${data.length}` });
  }
  if (schema.maxLength !== undefined && typeof data === 'string' && data.length > schema.maxLength) {
    errors.push({ path: path || 'root', message: `Max length is ${schema.maxLength}, got ${data.length}` });
  }
  if (schema.minimum !== undefined && typeof data === 'number' && data < schema.minimum) {
    errors.push({ path: path || 'root', message: `Min value is ${schema.minimum}, got ${data}` });
  }
  if (schema.maximum !== undefined && typeof data === 'number' && data > schema.maximum) {
    errors.push({ path: path || 'root', message: `Max value is ${schema.maximum}, got ${data}` });
  }
  if (schema.pattern && typeof data === 'string' && !new RegExp(schema.pattern).test(data)) {
    errors.push({ path: path || 'root', message: `Does not match pattern: ${schema.pattern}` });
  }
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push({ path: path || 'root', message: `Must be one of: ${schema.enum.join(', ')}` });
  }

  return errors;
}

const SAMPLE_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "integer", "minimum": 0 },
    "email": { "type": "string", "pattern": "^[^@]+@[^@]+$" },
    "role": { "type": "string", "enum": ["admin", "user", "guest"] }
  },
  "required": ["name", "age", "email"]
}`;

const SAMPLE_DATA = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "role": "admin"
}`;

export default function JsonSchemaPage() {
  const { addEntry } = useHistory();
  const [schema, setSchema] = useState('');
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  const validation = useCallback(() => {
    if (!schema.trim() || !data.trim()) return { valid: false, errors: [] };
    try {
      const s = JSON.parse(schema);
      const d = JSON.parse(data);
      setError('');
      const errors = validateSchema(d, s);
      addEntry('JSON Schema Validator');
      return { valid: errors.length === 0, errors };
    } catch (e) {
      setError(e.message);
      return { valid: false, errors: [] };
    }
  }, [schema, data, addEntry]);

  const result = validation();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">✓</span>
        <h1 className="font-heading text-2xl font-bold text-text">JSON Schema Validator</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setSchema(SAMPLE_SCHEMA); setData(SAMPLE_DATA); }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-text-tertiary hover:text-text bg-surface border border-border transition-all cursor-pointer">
          Load Example
        </button>
        <button onClick={() => { setSchema(''); setData(''); setError(''); }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-text-tertiary hover:text-text bg-surface border border-border transition-all cursor-pointer">
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">JSON Schema</span>
              {schema && <CopyButton text={schema} />}
            </div>
            <textarea value={schema} onChange={e => setSchema(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste JSON Schema..." />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary font-semibold">Data to Validate</span>
              {data && <CopyButton text={data} />}
            </div>
            <textarea value={data} onChange={e => setData(e.target.value)} rows={16}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Paste JSON data..." />
          </div>
        </GlassCard>
      </div>

      {schema.trim() && data.trim() && !error && (
        <GlassCard className="mt-5">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${result.valid ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs font-semibold text-text">{result.valid ? 'Valid ✓' : `${result.errors.length} error(s) found`}</span>
            </div>
            {!result.valid && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono">
                    <span className="text-red-500 shrink-0">✗</span>
                    <span className="text-text-tertiary shrink-0">{e.path}:</span>
                    <span className="text-red-600">{e.message}</span>
                  </div>
                ))}
              </div>
            )}
            {result.valid && (
              <span className="text-xs text-green-600">Data matches the schema perfectly.</span>
            )}
          </div>
        </GlassCard>
      )}

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
