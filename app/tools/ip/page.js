'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function isPrivateIPv4(octets) {
  if (octets[0] === 10) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  return false;
}

function isLoopback(octets) {
  return octets[0] === 127;
}

function isLinkLocal(octets) {
  return octets[0] === 169 && octets[1] === 254;
}

function isMulticast(octets) {
  return octets[0] >= 224 && octets[0] <= 239;
}

function isBroadcast(octets) {
  return octets.every(o => o === 255);
}

function ipClass(octets) {
  const first = octets[0];
  if (first <= 126) return 'A';
  if (first <= 191) return 'B';
  if (first <= 223) return 'C';
  if (first <= 239) return 'D';
  return 'E';
}

function parseIPv4(str) {
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

function parseIPv6(str) {
  const s = str.trim().toLowerCase();
  const segments = [];
  let parts = s.split(':');
  if (parts.length < 2 || parts.length > 8) return null;
  let doubleColon = false;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '') {
      if (doubleColon) return null;
      doubleColon = true;
      continue;
    }
    if (!/^[0-9a-f]{1,4}$/.test(parts[i])) return null;
    segments.push(parseInt(parts[i], 16));
  }
  if (doubleColon) {
    const missing = 8 - segments.length;
    if (missing < 1) return null;
    for (let i = 0; i < missing; i++) segments.push(0);
  }
  if (segments.length !== 8) return null;
  return segments;
}

const infoRows = [
  { label: 'Private', check: (o) => isPrivateIPv4(o) },
  { label: 'Loopback', check: isLoopback },
  { label: 'Link-Local', check: isLinkLocal },
  { label: 'Multicast', check: isMulticast },
  { label: 'Broadcast', check: isBroadcast },
];

export default function IpPage() {
  const { addEntry } = useHistory();
  const [input, setInput] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  const lookup = useCallback(() => {
    setError('');
    setInfo(null);
    const trimmed = input.trim();
    if (!trimmed) { setError('Enter an IP address.'); return; }

    const v4 = parseIPv4(trimmed);
    if (v4) {
      const bin = v4.map(o => o.toString(2).padStart(8, '0')).join('.');
      const cls = ipClass(v4);
      const flags = infoRows.map(({ label, check }) => ({ label, active: check(v4) }));
      setInfo({ version: 4, v4, cls, flags, bin, str: trimmed, isPrivate: isPrivateIPv4(v4) });
      addEntry('IP Info Lookup');
      return;
    }

    const v6 = parseIPv6(trimmed);
    if (v6) {
      const isPrivate = v6[0] === 0xfd || (v6[0] === 0xfe && (v6[1] & 0xc0) === 0x80);
      const isLoopback = v6.slice(0, 7).every(s => s === 0) && v6[7] === 1;
      const isLinkLocal = v6[0] === 0xfe && (v6[1] & 0xc0) === 0x80;
      const isMulticast = v6[0] === 0xff;
      setInfo({ version: 6, v6, isPrivate, isLoopback, isLinkLocal, isMulticast, str: trimmed });
      addEntry('IP Info Lookup');
      return;
    }

    setError('Invalid IP address format.');
  }, [input, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">🌐</span>
        <h1 className="font-heading text-2xl font-bold text-text">IP Info Lookup</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-3 block">IP Address</label>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 192.168.1.1 or 2001:db8::1"
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            <button onClick={lookup} className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Lookup</button>
          </div>
        </div>
      </GlassCard>

      {info && (
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">IP Information</span>
              <CopyButton text={info.str} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                <span className="text-[10px] text-text-tertiary block">Version</span>
                <span className="text-sm font-mono text-text">IPv{info.version}</span>
              </div>
              <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                <span className="text-[10px] text-text-tertiary block">Private Range</span>
                <span className={`text-sm font-mono ${info.isPrivate ? 'text-cat-document' : 'text-text'}`}>{info.isPrivate ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {info.version === 4 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <span className="text-[10px] text-text-tertiary block">Class</span>
                    <span className="text-sm font-mono text-text">Class {info.cls}</span>
                  </div>
                  {info.flags.filter(f => f.active).map(f => (
                    <div key={f.label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                      <span className="text-[10px] text-text-tertiary block">{f.label}</span>
                      <span className="text-sm font-mono text-cat-document">Yes</span>
                    </div>
                  ))}
                </div>

                <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                  <span className="text-[10px] text-text-tertiary block">Binary</span>
                  <span className="text-sm font-mono text-text break-all">{info.bin}</span>
                  <CopyButton text={info.bin} />
                </div>
              </>
            )}

            {info.version === 6 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Loopback', val: info.isLoopback },
                  { label: 'Link-Local', val: info.isLinkLocal },
                  { label: 'Multicast', val: info.isMulticast },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-surface rounded-lg px-3 py-2 border border-border/50">
                    <span className="text-[10px] text-text-tertiary block">{label}</span>
                    <span className={`text-sm font-mono ${val ? 'text-cat-document' : 'text-text'}`}>{val ? 'Yes' : 'No'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}
      {error && <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
    </motion.div>
  );
}
