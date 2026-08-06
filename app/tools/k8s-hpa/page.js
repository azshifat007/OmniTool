'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function K8sHpaPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('app-hpa');
  const [target, setTarget] = useState('my-deployment');
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(10);
  const [cpuPercent, setCpuPercent] = useState(50);
  const [output, setOutput] = useState('');

  const generate = useCallback(() => {
    addEntry('K8s HPA Generator');
    const yaml = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${name.trim() || 'app-hpa'}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${target.trim() || 'my-deployment'}
  minReplicas: ${min}
  maxReplicas: ${max}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${cpuPercent}`;
    setOutput(yaml);
  }, [name, target, min, max, cpuPercent, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s HPA Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-secondary">Generate a Kubernetes HorizontalPodAutoscaler manifest for auto-scaling deployments.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Target Deployment</label>
                <input value={target} onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Min Replicas</label>
                <input type="number" min={1} value={min} onChange={(e) => setMin(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Max Replicas</label>
                <input type="number" min={1} value={max} onChange={(e) => setMax(parseInt(e.target.value) || 10)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">CPU Target %</label>
                <input type="number" min={1} max={100} value={cpuPercent} onChange={(e) => setCpuPercent(parseInt(e.target.value) || 50)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">hpa.yaml</span>
              {output && <CopyButton text={output} className="text-xs" />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[280px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
