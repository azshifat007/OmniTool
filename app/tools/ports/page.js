'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const portGroups = [
  { group: 'Web', ports: [
    { port: 80, proto: 'TCP', name: 'HTTP', desc: 'Hypertext Transfer Protocol - web traffic.' },
    { port: 443, proto: 'TCP', name: 'HTTPS', desc: 'HTTP over TLS/SSL - encrypted web traffic.' },
    { port: 8080, proto: 'TCP', name: 'HTTP-Alt', desc: 'Alternative HTTP port, often used for proxies and dev servers.' },
    { port: 8443, proto: 'TCP', name: 'HTTPS-Alt', desc: 'Alternative HTTPS port.' },
    { port: 8000, proto: 'TCP', name: 'HTTP-Alt', desc: 'Commonly used for development web servers.' },
    { port: 3000, proto: 'TCP', name: 'Dev Server', desc: 'Common port for Node.js/React dev servers.' },
    { port: 5000, proto: 'TCP', name: 'Dev Server', desc: 'Common port for Python Flask and other frameworks.' },
  ]},
  { group: 'File Transfer', ports: [
    { port: 20, proto: 'TCP', name: 'FTP-Data', desc: 'File Transfer Protocol - data transfer channel.' },
    { port: 21, proto: 'TCP', name: 'FTP', desc: 'File Transfer Protocol - control channel.' },
    { port: 69, proto: 'UDP', name: 'TFTP', desc: 'Trivial File Transfer Protocol, used for booting devices.' },
    { port: 989, proto: 'TCP', name: 'FTPS-Data', desc: 'FTP over TLS/SSL - data channel.' },
    { port: 990, proto: 'TCP', name: 'FTPS', desc: 'FTP over TLS/SSL - control channel.' },
    { port: 115, proto: 'TCP', name: 'SFTP', desc: 'Simple File Transfer Protocol (not SSH-based).' },
  ]},
  { group: 'Email', ports: [
    { port: 25, proto: 'TCP', name: 'SMTP', desc: 'Simple Mail Transfer Protocol - outgoing mail.' },
    { port: 465, proto: 'TCP', name: 'SMTPS', desc: 'SMTP over TLS/SSL.' },
    { port: 587, proto: 'TCP', name: 'SMTP-Submit', desc: 'SMTP with STARTTLS, used for mail submission.' },
    { port: 110, proto: 'TCP', name: 'POP3', desc: 'Post Office Protocol v3 - incoming mail retrieval.' },
    { port: 995, proto: 'TCP', name: 'POP3S', desc: 'POP3 over TLS/SSL.' },
    { port: 143, proto: 'TCP', name: 'IMAP', desc: 'Internet Message Access Protocol - incoming mail.' },
    { port: 993, proto: 'TCP', name: 'IMAPS', desc: 'IMAP over TLS/SSL.' },
  ]},
  { group: 'Remote Access', ports: [
    { port: 22, proto: 'TCP', name: 'SSH', desc: 'Secure Shell - encrypted remote terminal access.' },
    { port: 23, proto: 'TCP', name: 'Telnet', desc: 'Unencrypted remote terminal access (legacy).' },
    { port: 3389, proto: 'TCP', name: 'RDP', desc: 'Remote Desktop Protocol - Windows remote desktop.' },
    { port: 5900, proto: 'TCP', name: 'VNC', desc: 'Virtual Network Computing - remote desktop sharing.' },
    { port: 5901, proto: 'TCP', name: 'VNC-1', desc: 'VNC display :1 (commonly used).' },
  ]},
  { group: 'Database', ports: [
    { port: 3306, proto: 'TCP', name: 'MySQL', desc: 'MySQL database server.' },
    { port: 5432, proto: 'TCP', name: 'PostgreSQL', desc: 'PostgreSQL database server.' },
    { port: 27017, proto: 'TCP', name: 'MongoDB', desc: 'MongoDB database server.' },
    { port: 6379, proto: 'TCP', name: 'Redis', desc: 'Redis key-value data store.' },
    { port: 1433, proto: 'TCP', name: 'MSSQL', desc: 'Microsoft SQL Server.' },
    { port: 1521, proto: 'TCP', name: 'Oracle DB', desc: 'Oracle database default listener port.' },
    { port: 9042, proto: 'TCP', name: 'Cassandra', desc: 'Apache Cassandra native transport.' },
    { port: 9200, proto: 'TCP', name: 'Elasticsearch', desc: 'Elasticsearch REST API.' },
    { port: 8086, proto: 'TCP', name: 'InfluxDB', desc: 'InfluxDB HTTP API.' },
  ]},
  { group: 'Directory & Auth', ports: [
    { port: 389, proto: 'TCP', name: 'LDAP', desc: 'Lightweight Directory Access Protocol.' },
    { port: 636, proto: 'TCP', name: 'LDAPS', desc: 'LDAP over TLS/SSL.' },
    { port: 1812, proto: 'UDP', name: 'RADIUS-Auth', desc: 'RADIUS authentication protocol.' },
    { port: 1813, proto: 'UDP', name: 'RADIUS-Acct', desc: 'RADIUS accounting protocol.' },
  ]},
  { group: 'Network Infrastructure', ports: [
    { port: 53, proto: 'TCP/UDP', name: 'DNS', desc: 'Domain Name System - resolves domain names to IPs.' },
    { port: 67, proto: 'UDP', name: 'DHCP-Server', desc: 'Dynamic Host Configuration Protocol - server.' },
    { port: 68, proto: 'UDP', name: 'DHCP-Client', desc: 'Dynamic Host Configuration Protocol - client.' },
    { port: 123, proto: 'UDP', name: 'NTP', desc: 'Network Time Protocol - clock synchronization.' },
    { port: 161, proto: 'UDP', name: 'SNMP', desc: 'Simple Network Management Protocol - monitoring.' },
    { port: 162, proto: 'UDP', name: 'SNMP-Trap', desc: 'SNMP trap notifications.' },
    { port: 179, proto: 'TCP', name: 'BGP', desc: 'Border Gateway Protocol - core internet routing.' },
    { port: 514, proto: 'UDP', name: 'Syslog', desc: 'System logging protocol.' },
    { port: 1900, proto: 'UDP', name: 'UPnP-SSDP', desc: 'Simple Service Discovery Protocol (UPnP).' },
  ]},
  { group: 'Messaging & Streaming', ports: [
    { port: 1883, proto: 'TCP', name: 'MQTT', desc: 'MQ Telemetry Transport - IoT messaging.' },
    { port: 8883, proto: 'TCP', name: 'MQTTS', desc: 'MQTT over TLS/SSL.' },
    { port: 5672, proto: 'TCP', name: 'AMQP', desc: 'Advanced Message Queuing Protocol (RabbitMQ).' },
    { port: 1935, proto: 'TCP', name: 'RTMP', desc: 'Real-Time Messaging Protocol (streaming).' },
    { port: 554, proto: 'TCP', name: 'RTSP', desc: 'Real Time Streaming Protocol.' },
  ]},
  { group: 'Container & Orchestration', ports: [
    { port: 2375, proto: 'TCP', name: 'Docker-API', desc: 'Docker REST API (unencrypted).' },
    { port: 2376, proto: 'TCP', name: 'Docker-API-TLS', desc: 'Docker REST API (TLS).' },
    { port: 6443, proto: 'TCP', name: 'K8s-API', desc: 'Kubernetes API server.' },
    { port: 8444, proto: 'TCP', name: 'K8s-Dashboard', desc: 'Kubernetes web UI dashboard.' },
  ]},
];

const groupColors = {
  'Web': 'text-cat-code',
  'File Transfer': 'text-cat-date',
  'Email': 'text-cat-document',
  'Remote Access': 'text-cat-media',
  'Database': 'text-cat-success',
  'Directory & Auth': 'text-cat-code',
  'Network Infrastructure': 'text-cat-network',
  'Messaging & Streaming': 'text-cat-date',
  'Container & Orchestration': 'text-cat-text',
};

export default function PortsPage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');

  const filtered = portGroups.map(group => ({
    ...group,
    ports: group.ports.filter(p =>
      !search.trim() ||
      p.port.toString().includes(search.trim()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase()) ||
      p.proto.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.ports.length > 0);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    addEntry('Port Reference');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">[=]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Port Reference</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Search port number, service, or protocol</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. 443, HTTPS, SSH..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      <div className="mt-5 space-y-5">
        {filtered.map(group => (
          <GlassCard key={group.group}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm font-bold ${groupColors[group.group] || 'text-text'}`}>{group.group}</span>
                <span className="text-xs text-text-tertiary">({group.ports.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-text-tertiary border-b border-border">
                      <th className="text-left py-2 pr-3 font-medium w-20">Port</th>
                      <th className="text-left py-2 pr-3 font-medium w-24">Protocol</th>
                      <th className="text-left py-2 pr-3 font-medium w-36">Service</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.ports.map(({ port, proto, name, desc }) => (
                      <tr key={`${port}-${name}`} onClick={() => handleCopy(`${port}/${proto} ${name}`)}
                        className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-surface/50 transition-colors">
                        <td className="py-2 pr-3 text-text font-mono font-bold align-top">{port}</td>
                        <td className="py-2 pr-3 text-text-tertiary font-mono text-xs align-top">{proto}</td>
                        <td className="py-2 pr-3 text-text-secondary font-mono align-top">{name}</td>
                        <td className="py-2 text-text-tertiary text-xs align-top">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">No matching ports found.</div>
      )}
    </motion.div>
  );
}
