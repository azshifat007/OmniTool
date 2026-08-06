'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseIP(str) {
  const parts = str.trim().split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map(p => {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255 || p !== n.toString()) return null;
    return n;
  });
  if (octets.some(o => o === null)) return null;
  return octets;
}

function cidrToMask(prefix) {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(prefix, 8);
    mask.push((256 - (1 << (8 - bits))) % 256);
    prefix -= bits;
  }
  return mask;
}

function maskToWildcard(mask) {
  return mask.map(o => ~o & 0xFF);
}

function applyMask(ip, mask) {
  return ip.map((o, i) => o & mask[i]);
}

function orMask(ip, mask) {
  return ip.map((o, i) => o | (~mask[i] & 0xFF));
}

function toBin(octets) {
  return octets.map(o => o.toString(2).padStart(8, '0')).join('.');
}

function formatIP(octets) {
  return octets.join('.');
}

export default function SubnetPage() {
  const { addEntry } = useHistory();
  const [ipInput, setIpInput] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = useCallback(() => {
    setError('');
    const ip = parseIP(ipInput);
    if (!ip) { setError('Enter a valid IPv4 address.'); setResult(null); return; }

    const mask = cidrToMask(cidr);
    const network = applyMask(ip, mask);
    const broadcast = orMask(ip, mask);
    const wildcard = maskToWildcard(mask);
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalHosts - 2);
    const firstUsable = usableHosts > 0 ? [...network] : null;
    const lastUsable = usableHosts > 0 ? [...broadcast] : null;
    if (firstUsable) firstUsable[3] += 1;
    if (lastUsable) lastUsable[3] -= 1;

    setResult({
      ip: formatIP(ip),
      network: formatIP(network),
      broadcast: formatIP(broadcast),
      mask: formatIP(mask),
      wildcard: formatIP(wildcard),
      cidr: `/${cidr}`,
      firstUsable: firstUsable ? formatIP(firstUsable) : 'N/A',
      lastUsable: lastUsable ? formatIP(lastUsable) : 'N/A',
      totalHosts,
      usableHosts,
      ipBin: toBin(ip),
      maskBin: toBin(mask),
    });
    addEntry('Subnet Calculator');
  }, [ipInput, cidr, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">🌐</span>
        <h1 className="font-heading text-2xl font-bold text-text">Subnet Calculator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">IP Address</label>
            <input value={ipInput} onChange={(e) => setIpInput(e.target.value)} placeholder="e.g. 192.168.1.0"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
              className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-text-tertiary mb-2 block">CIDR Prefix: /{cidr}</label>
            <input type="range" min={8} max={30} value={cidr} onChange={(e) => setCidr(parseInt(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-text-secondary"><span>/8</span><span>/30</span></div>
          </div>
          <button onClick={handleCalculate} className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Calculate</button>
        </div>
      </GlassCard>

      {result && (
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Subnet Information</span>
              <CopyButton text={`${result.ip}/${result.cidr}`} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Network Address', val: result.network },
                { label: 'Broadcast Address', val: result.broadcast },
                { label: 'Subnet Mask', val: `${result.mask} (${result.cidr})` },
                { label: 'Wildcard Mask', val: result.wildcard },
                { label: 'First Usable Host', val: result.firstUsable },
                { label: 'Last Usable Host', val: result.lastUsable },
                { label: 'Total Hosts', val: result.totalHosts.toLocaleString() },
                { label: 'Usable Hosts', val: result.usableHosts.toLocaleString() },
              ].map(({ label, val }) => (
                <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <span className="text-[10px] text-text-tertiary block">{label}</span>
                  <span className="text-sm font-mono text-text break-all">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {result && (
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Binary Representation</span>
            <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
              <span className="text-[10px] text-text-tertiary block mb-1">IP</span>
              <span className="text-sm font-mono text-text break-all">{result.ipBin}</span>
            </div>
            <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
              <span className="text-[10px] text-text-tertiary block mb-1">Mask</span>
              <span className="text-sm font-mono text-text break-all">{result.maskBin}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
