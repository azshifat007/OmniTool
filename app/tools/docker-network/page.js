'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const NETWORK_TYPES = ['bridge', 'host', 'overlay', 'macvlan', 'ipvlan', 'none'];

export default function DockerNetworkPage() {
  const { addEntry } = useHistory();
  const [name, setName] = useState('my-network');
  const [driver, setDriver] = useState('bridge');
  const [subnet, setSubnet] = useState('172.18.0.0/16');
  const [gateway, setGateway] = useState('172.18.0.1');
  const [ipRange, setIpRange] = useState('172.18.0.0/24');
  const [labels, setLabels] = useState('');

  const yaml = useCallback(() => {
    const lines = [`version: '3.8'`, '', 'networks:', `  ${name}:`, `    driver: ${driver}`];
    if (driver !== 'host') {
      lines.push('    ipam:');
      lines.push('      config:');
      lines.push(`        - subnet: ${subnet}`);
      if (gateway) lines.push(`          gateway: ${gateway}`);
      if (ipRange) lines.push(`          ip_range: ${ipRange}`);
    }
    if (labels.trim()) {
      lines.push('    labels:');
      labels.split('\n').filter(Boolean).forEach(l => lines.push(`      ${l}`));
    }
    return lines.join('\n');
  }, [name, driver, subnet, gateway, ipRange, labels]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Docker Network Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label>
                <span className="text-xs text-text-tertiary block mb-1">Network Name</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
              </label>
              <label>
                <span className="text-xs text-text-tertiary block mb-1">Driver</span>
                <select value={driver} onChange={e => setDriver(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none cursor-pointer">
                  {NETWORK_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            </div>
            {driver !== 'host' && (
              <div className="grid grid-cols-3 gap-4">
                <label>
                  <span className="text-xs text-text-tertiary block mb-1">Subnet</span>
                  <input type="text" value={subnet} onChange={e => setSubnet(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none" />
                </label>
                <label>
                  <span className="text-xs text-text-tertiary block mb-1">Gateway</span>
                  <input type="text" value={gateway} onChange={e => setGateway(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none" />
                </label>
                <label>
                  <span className="text-xs text-text-tertiary block mb-1">IP Range</span>
                  <input type="text" value={ipRange} onChange={e => setIpRange(e.target.value)}
                    className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none" />
                </label>
              </div>
            )}
            <label>
              <span className="text-xs text-text-tertiary block mb-1">Labels (one per line)</span>
              <textarea value={labels} onChange={e => setLabels(e.target.value)} rows={3}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="environment: production&#10;team: backend" />
            </label>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">docker-compose.yml</span>
              <CopyButton text={yaml()} />
            </div>
            <pre className="text-xs font-mono text-text-secondary bg-surface rounded-lg p-3 border border-border overflow-x-auto min-h-[200px]">{yaml()}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
