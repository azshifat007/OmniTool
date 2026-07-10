'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function parseCIDR(cidr) {
  const [ipStr, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr);
  if (!ipStr || isNaN(bits) || bits < 0 || bits > 32) return null;
  const octets = ipStr.split('.').map(Number);
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) return null;
  const ipInt = octets.reduce((acc, o) => (acc << 8) + o, 0) >>> 0;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (ipInt | ~mask) >>> 0;
  const hostMin = bits < 31 ? network + 1 : network;
  const hostMax = bits < 31 ? broadcast - 1 : broadcast;
  const totalHosts = bits >= 31 ? Math.pow(2, 32 - bits) : Math.pow(2, 32 - bits) - 2;
  const wildcard = (~mask >>> 0);
  const invMask = ~mask >>> 0;
  const ranges = [];
  for (let i = 0; i < 4; i++) {
    ranges.push({
      start: (network >> (24 - i * 8)) & 0xFF,
      end: (broadcast >> (24 - i * 8)) & 0xFF,
    });
  }
  return {
    cidr, bits, ipStr, ipInt, mask, network, broadcast, hostMin, hostMax,
    totalHosts, wildcard, invMask, ranges,
    maskStr: [(mask >> 24) & 0xFF, (mask >> 16) & 0xFF, (mask >> 8) & 0xFF, mask & 0xFF].join('.'),
    networkStr: [(network >> 24) & 0xFF, (network >> 16) & 0xFF, (network >> 8) & 0xFF, network & 0xFF].join('.'),
    broadcastStr: [(broadcast >> 24) & 0xFF, (broadcast >> 16) & 0xFF, (broadcast >> 8) & 0xFF, broadcast & 0xFF].join('.'),
    hostMinStr: [(hostMin >> 24) & 0xFF, (hostMin >> 16) & 0xFF, (hostMin >> 8) & 0xFF, hostMin & 0xFF].join('.'),
    hostMaxStr: [(hostMax >> 24) & 0xFF, (hostMax >> 16) & 0xFF, (hostMax >> 8) & 0xFF, hostMax & 0xFF].join('.'),
    wildcardStr: [(wildcard >> 24) & 0xFF, (wildcard >> 16) & 0xFF, (wildcard >> 8) & 0xFF, wildcard & 0xFF].join('.'),
  };
}

const examples = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.1/32', '0.0.0.0/0'];

export default function CidrCalcPage() {
  const { addEntry } = useHistory();
  const [cidr, setCidr] = useState('192.168.1.0/24');

  const info = useMemo(() => {
    const result = parseCIDR(cidr);
    if (result) addEntry('CIDR Calculator');
    return result;
  }, [cidr, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⊞</span>
        <h1 className="font-heading text-2xl font-bold text-text">CIDR Calculator</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <label className="text-xs text-text-tertiary mb-1 block">CIDR Notation</label>
          <input value={cidr} onChange={e => setCidr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setCidr(cidr)}
            placeholder="192.168.1.0/24"
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
          <div className="flex flex-wrap gap-1.5">
            {examples.map(ex => (
              <button key={ex} onClick={() => setCidr(ex)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${cidr === ex ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border/50 hover:border-primary/40'}`}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {info && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-5">
          <GlassCard>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Network', value: info.networkStr },
                  { label: 'Broadcast', value: info.broadcastStr },
                  { label: 'Netmask', value: info.maskStr },
                  { label: 'Wildcard', value: info.wildcardStr },
                  { label: 'Host Range', value: `${info.hostMinStr} - ${info.hostMaxStr}` },
                  { label: 'Total Hosts', value: info.totalHosts.toLocaleString() },
                  { label: 'First Host', value: info.hostMinStr },
                  { label: 'Last Host', value: info.hostMaxStr },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <div className="text-xs text-text-tertiary">{label}</div>
                    <div className="text-xs font-mono text-text font-medium mt-0.5 break-all">{value}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <CopyButton text={`${info.networkStr}/${info.bits}`} />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Subnet Visualization</span>
              <div className="space-y-1">
                {[0, 8, 16, 24].map(offset => {
                  const octetIdx = offset / 8;
                  const bitsInOctet = Math.max(0, Math.min(8, info.bits - offset));
                  const start = info.ranges[octetIdx].start;
                  const end = info.ranges[octetIdx].end;
                  return (
                    <div key={offset} className="flex items-center gap-3">
                      <span className="text-xs text-text-tertiary w-16">Octet {octetIdx + 1}</span>
                      <div className="flex-1 flex gap-0.5">
                        {Array.from({ length: 8 }, (_, i) => {
                          const bitPos = offset + i;
                          const isNetwork = bitPos < info.bits;
                          return (
                            <div key={i} className={`flex-1 h-5 rounded-sm ${isNetwork ? 'bg-primary/40' : 'bg-cat-success/30'}`}
                              title={`Bit ${bitPos}: ${isNetwork ? 'Network' : 'Host'}`} />
                          );
                        })}
                      </div>
                      <span className="text-xs font-mono text-text-tertiary w-24 text-right">{start} - {end}</span>
                    </div>
                  );
                })}
                <div className="flex gap-3 mt-2 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/40 inline-block" /> Network bits</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cat-success/30 inline-block" /> Host bits</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Binary Representation</span>
              <div className="font-mono text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary w-16">IP</span>
                  <span className="text-text">{info.ipStr.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary w-16">Mask</span>
                  <span className="text-text">{info.maskStr.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary w-16">Network</span>
                  <span className="text-text">{info.networkStr.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary w-16">Broadcast</span>
                  <span className="text-text">{info.broadcastStr.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.')}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
