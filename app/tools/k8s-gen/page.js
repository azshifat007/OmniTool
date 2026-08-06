'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const ports = [80, 443, 3000, 8080, 5432, 6379, 27017];

export default function K8sGenPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('my-app');
  const [image, setImage] = useState('nginx:latest');
  const [replicas, setReplicas] = useState(2);
  const [containerPort, setContainerPort] = useState(80);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    const lines = [
      `apiVersion: apps/v1`,
      `kind: Deployment`,
      `metadata:`,
      `  name: ${name}`,
      `  labels:`,
      `    app: ${name}`,
      `spec:`,
      `  replicas: ${replicas}`,
      `  selector:`,
      `    matchLabels:`,
      `      app: ${name}`,
      `  template:`,
      `    metadata:`,
      `      labels:`,
      `        app: ${name}`,
      `    spec:`,
      `      containers:`,
      `      - name: ${name}`,
      `        image: ${image}`,
      `        ports:`,
      `        - containerPort: ${containerPort}`,
      `        resources:`,
      `          requests:`,
      `            memory: "256Mi"`,
      `            cpu: "250m"`,
      `          limits:`,
      `            memory: "512Mi"`,
      `            cpu: "500m"`,
      `---`,
      `apiVersion: v1`,
      `kind: Service`,
      `metadata:`,
      `  name: ${name}-svc`,
      `spec:`,
      `  selector:`,
      `    app: ${name}`,
      `  ports:`,
      `  - protocol: TCP`,
      `    port: 80`,
      `    targetPort: ${containerPort}`,
      `  type: ClusterIP`,
    ];
    setOutput(lines.join('\n'));
    addEntry('K8s Deployment Generator');
  }, [name, image, replicas, containerPort, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s Deployment Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">App Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Image</label>
              <input value={image} onChange={(e) => setImage(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1.5 block">Replicas</label>
                <input type="number" min={1} max={20} value={replicas} onChange={(e) => setReplicas(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1.5 block">Container Port</label>
                <input type="number" min={1} max={65535} value={containerPort} onChange={(e) => setContainerPort(parseInt(e.target.value) || 80)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Common Ports</label>
              <div className="flex flex-wrap gap-1.5">
                {ports.map(p => (
                  <button key={p} onClick={() => setContainerPort(p)}
                    className={`px-2 py-1 text-[10px] font-medium rounded-md border cursor-pointer ${
                      containerPort === p ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:text-text'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">k8s-deployment.yaml</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
