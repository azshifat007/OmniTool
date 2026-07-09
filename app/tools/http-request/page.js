'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function HttpRequestPage() {
  const { addEntry } = useHistory();
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (i) => { if (headers.length > 1) setHeaders(headers.filter((_, idx) => idx !== i)); };
  const updateHeader = (i, field, val) => {
    const h = [...headers]; h[i][field] = val; setHeaders(h);
  };

  const send = async () => {
    setError('');
    setResponse(null);
    if (!url.trim()) { setError('Enter a URL'); return; }
    setLoading(true);
    try {
      const opts = { method };
      const hdrs = {};
      headers.forEach((h) => { if (h.key) hdrs[h.key] = h.value; });
      if (Object.keys(hdrs).length) opts.headers = hdrs;
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) opts.body = body;
      const start = performance.now();
      const res = await fetch(url, opts);
      const elapsed = Math.round(performance.now() - start);
      let text = '';
      try { text = await res.text(); } catch { text = '(unable to read body)'; }
      let formatted = text;
      let contentType = 'text';
      try { const j = JSON.parse(text); formatted = JSON.stringify(j, null, 2); contentType = 'json'; } catch {}
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: [...res.headers.entries()],
        body: formatted,
        contentType,
        elapsed,
        size: new Blob([text]).size,
      });
      addEntry('HTTP Request Builder');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⇶</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTTP Request Builder</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-28 bg-surface rounded-lg px-3 py-2 text-sm font-mono font-bold text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
              {methods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint"
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={send} disabled={loading}
              className="px-5 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Headers</span>
              <button onClick={addHeader} className="text-[10px] text-primary hover:underline cursor-pointer">+ Add</button>
            </div>
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} placeholder="Key"
                  className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <input value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} placeholder="Value"
                  className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                {headers.length > 1 && (
                  <button onClick={() => removeHeader(i)} className="text-text-tertiary hover:text-cat-text text-xs cursor-pointer">✕</button>
                )}
              </div>
            ))}
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Request Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder='{"key": "value"}'
                className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          )}
        </div>
      </GlassCard>

      {error && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>
      )}

      {response && (
        <GlassCard className="mt-4">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                response.status < 300 ? 'bg-green-500/10 text-green-500' :
                response.status < 400 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              }`}>{response.status} {response.statusText}</span>
              <span className="text-[10px] text-text-secondary">{response.elapsed}ms</span>
              <span className="text-[10px] text-text-secondary">{(response.size / 1024).toFixed(1)}KB</span>
            </div>

            {response.headers.length > 0 && (
              <div>
                <span className="text-xs text-text-tertiary mb-1 block">Response Headers</span>
                <div className="bg-surface rounded-lg p-2 max-h-32 overflow-y-auto border border-border">
                  {response.headers.map(([k, v]) => (
                    <div key={k} className="text-[10px] font-mono text-text-secondary leading-relaxed">
                      <span className="text-text-tertiary">{k}:</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">Response Body</span>
                <CopyButton text={response.body} />
              </div>
              <pre className="bg-surface rounded-lg p-3 text-xs font-mono text-text border border-border overflow-x-auto max-h-96 whitespace-pre-wrap break-all">{response.body}</pre>
            </div>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
