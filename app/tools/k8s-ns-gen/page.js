'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function K8sNsGenPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('my-namespace');
  const [desc, setDesc] = useState('My Kubernetes namespace');

  const yaml = `apiVersion: v1
kind: Namespace
metadata:
  name: ${name || 'my-namespace'}
  labels:
    name: ${name || 'my-namespace'}
  ${desc ? `annotations:\n    description: "${desc}"` : ''}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">☸</span>
        <h1 className="font-heading text-2xl font-bold text-text">K8s Namespace Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Namespace Properties</span>
            <div>
              <label className="text-[10px] text-text-tertiary">Name</label>
              <input value={name} onChange={(e) => { setName(e.target.value); addEntry('K8s Namespace Generator'); }}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-text-tertiary">Description (annotation)</label>
              <input value={desc} onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-surface rounded-lg px-2 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">namespace.yaml</span>
              <CopyButton text={yaml} className="text-xs" />
            </div>
            <pre className="bg-surface rounded-xl p-4 text-xs font-mono text-text border border-border/50 overflow-x-auto">{yaml}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
