'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function K8sPodPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('my-pod');
  const [image, setImage] = useState('nginx:latest');
  const [containerPort, setContainerPort] = useState(80);
  const [restart, setRestart] = useState('Always');
  const [envVars, setEnvVars] = useState([{ key: 'ENV', val: 'production' }]);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    addEntry('K8s Pod Generator');
    const envLines = envVars.filter(e => e.key.trim()).map(e => `    - name: ${e.key.trim()}\n      value: "${e.val.trim()}"`).join('\n');
    const yaml = `apiVersion: v1
kind: Pod
metadata:
  name: ${name.trim() || 'my-pod'}
  labels:
    app: ${name.trim() || 'my-pod'}
spec:
  restartPolicy: ${restart}
  containers:
  - name: ${name.trim() || 'my-pod'}
    image: ${image.trim() || 'nginx:latest'}
    ports:
    - containerPort: ${containerPort}
${envLines ? `    env:\n${envLines}` : ''}
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"`;
    setOutput(yaml);
  }, [name, image, containerPort, restart, envVars, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s Pod Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Pod Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Image</label>
              <input value={image} onChange={(e) => setImage(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Container Port</label>
                <input type="number" min={1} max={65535} value={containerPort} onChange={(e) => setContainerPort(parseInt(e.target.value) || 80)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Restart Policy</label>
                <select value={restart} onChange={(e) => setRestart(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  <option>Always</option><option>OnFailure</option><option>Never</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Environment Variables</label>
              {envVars.map((e, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={e.key} onChange={(e2) => { const n = [...envVars]; n[i] = { ...n[i], key: e2.target.value }; setEnvVars(n); }} placeholder="KEY"
                    className="w-28 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <input value={e.val} onChange={(e2) => { const n = [...envVars]; n[i] = { ...n[i], val: e2.target.value }; setEnvVars(n); }} placeholder="value"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => { if (envVars.length > 1) setEnvVars(envVars.filter((_, j) => j !== i)); }} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === envVars.length - 1 && <button onClick={() => setEnvVars([...envVars, { key: '', val: '' }])} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">pod.yaml</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
