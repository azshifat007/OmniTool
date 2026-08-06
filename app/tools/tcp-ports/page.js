'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const COMMON_PORTS = [
  { port: 20, name: 'FTP Data', proto: 'TCP' },
  { port: 21, name: 'FTP Control', proto: 'TCP' },
  { port: 22, name: 'SSH', proto: 'TCP' },
  { port: 23, name: 'Telnet', proto: 'TCP' },
  { port: 25, name: 'SMTP', proto: 'TCP' },
  { port: 53, name: 'DNS', proto: 'UDP' },
  { port: 67, name: 'DHCP Server', proto: 'UDP' },
  { port: 68, name: 'DHCP Client', proto: 'UDP' },
  { port: 80, name: 'HTTP', proto: 'TCP' },
  { port: 110, name: 'POP3', proto: 'TCP' },
  { port: 123, name: 'NTP', proto: 'UDP' },
  { port: 143, name: 'IMAP', proto: 'TCP' },
  { port: 161, name: 'SNMP', proto: 'UDP' },
  { port: 194, name: 'IRC', proto: 'TCP' },
  { port: 443, name: 'HTTPS', proto: 'TCP' },
  { port: 445, name: 'SMB', proto: 'TCP' },
  { port: 465, name: 'SMTPS', proto: 'TCP' },
  { port: 514, name: 'Syslog', proto: 'UDP' },
  { port: 543, name: 'RTSP', proto: 'TCP' },
  { port: 587, name: 'SMTP Submission', proto: 'TCP' },
  { port: 631, name: 'IPP', proto: 'TCP' },
  { port: 993, name: 'IMAPS', proto: 'TCP' },
  { port: 995, name: 'POP3S', proto: 'TCP' },
  { port: 1080, name: 'SOCKS', proto: 'TCP' },
  { port: 1194, name: 'OpenVPN', proto: 'UDP' },
  { port: 1433, name: 'MSSQL', proto: 'TCP' },
  { port: 1521, name: 'Oracle DB', proto: 'TCP' },
  { port: 2049, name: 'NFS', proto: 'UDP' },
  { port: 2375, name: 'Docker REST', proto: 'TCP' },
  { port: 3306, name: 'MySQL', proto: 'TCP' },
  { port: 3389, name: 'RDP', proto: 'TCP' },
  { port: 5432, name: 'PostgreSQL', proto: 'TCP' },
  { port: 5900, name: 'VNC', proto: 'TCP' },
  { port: 6379, name: 'Redis', proto: 'TCP' },
  { port: 6443, name: 'K8s API', proto: 'TCP' },
  { port: 8080, name: 'HTTP Alt', proto: 'TCP' },
  { port: 8443, name: 'HTTPS Alt', proto: 'TCP' },
  { port: 27017, name: 'MongoDB', proto: 'TCP' },
];

export default function TcpPortsPage() {
  const { addEntry } = useHistory();
  const [query, setQuery] = useState('');
  const [proto, setProto] = useState('all');

  const filtered = COMMON_PORTS.filter(p => {
    if (proto !== 'all' && p.proto !== proto) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return String(p.port).includes(q) || p.name.toLowerCase().includes(q);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">⇋</span>
        <h1 className="font-heading text-2xl font-bold text-text">TCP/UDP Port Scanner</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search port number or service name..."
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none" />
            <div className="flex gap-1">
              {['all', 'TCP', 'UDP'].map(p => (
                <button key={p} onClick={() => setProto(p)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    proto === p ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}>{p === 'all' ? 'All' : p}</button>
              ))}
            </div>
          </div>
          <div className="text-xs text-text-tertiary">{filtered.length} port{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-text-tertiary border-b border-border">
                  <th className="text-left py-2 pr-4">Port</th>
                  <th className="text-left py-2 pr-4">Protocol</th>
                  <th className="text-left py-2">Service</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.port} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="py-2 pr-4 font-mono text-text font-medium">{p.port}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.proto === 'TCP' ? 'bg-cat-code/10 text-cat-code' : 'bg-cat-media/10 text-cat-media'
                      }`}>{p.proto}</span>
                    </td>
                    <td className="py-2 text-text-secondary">{p.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
