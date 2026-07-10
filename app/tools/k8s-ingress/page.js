'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function K8sIngressPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('my-ingress');
  const [host, setHost] = useState('example.com');
  const [svcName, setSvcName] = useState('my-service');
  const [svcPort, setSvcPort] = useState(80);
  const [path, setPath] = useState('/');
  const [tls, setTls] = useState(false);
  const [tlsSecret, setTlsSecret] = useState('my-tls-secret');
  const [className, setClassName] = useState('nginx');
  const [annotations, setAnnotations] = useState([{ key: 'nginx.ingress.kubernetes.io/rewrite-target', val: '/' }]);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    addEntry('K8s Ingress Generator');
    const annLines = annotations.filter(a => a.key.trim()).map(a => `    ${a.key.trim()}: ${a.val.trim()}`).join('\n');
    const yaml = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name.trim() || 'my-ingress'}
${annLines ? `  annotations:\n${annLines}` : ''}
spec:
  ingressClassName: ${className.trim() || 'nginx'}
${tls ? `  tls:\n  - hosts:\n    - ${host.trim()}\n    secretName: ${tlsSecret.trim()}\n` : ''}  rules:
  - host: ${host.trim()}
    http:
      paths:
      - path: ${path.trim() || '/'}
        pathType: Prefix
        backend:
          service:
            name: ${svcName.trim() || 'my-service'}
            port:
              number: ${svcPort}`;
    setOutput(yaml);
  }, [name, host, svcName, svcPort, path, tls, tlsSecret, className, annotations, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s Ingress Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Host</label>
                <input value={host} onChange={(e) => setHost(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Path</label>
                <input value={path} onChange={(e) => setPath(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Service Name</label>
                <input value={svcName} onChange={(e) => setSvcName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Service Port</label>
                <input type="number" min={1} max={65535} value={svcPort} onChange={(e) => setSvcPort(parseInt(e.target.value) || 80)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Ingress Class</label>
                <select value={className} onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  <option>nginx</option><option>traefik</option><option>istio</option><option>haproxy</option><option>gce</option><option>alb</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={tls} onChange={(e) => setTls(e.target.checked)} className="accent-primary" />
                  <span className="text-xs text-text-secondary">Enable TLS</span>
                </label>
              </div>
            </div>
            {tls && (
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">TLS Secret Name</label>
                <input value={tlsSecret} onChange={(e) => setTlsSecret(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Annotations</label>
              {annotations.map((a, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={a.key} onChange={(e) => { const n = [...annotations]; n[i] = { ...n[i], key: e.target.value }; setAnnotations(n); }} placeholder="Key"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <input value={a.val} onChange={(e) => { const n = [...annotations]; n[i] = { ...n[i], val: e.target.value }; setAnnotations(n); }} placeholder="Value"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => { if (annotations.length > 1) setAnnotations(annotations.filter((_, j) => j !== i)); }} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === annotations.length - 1 && <button onClick={() => setAnnotations([...annotations, { key: '', val: '' }])} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">ingress.yaml</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
