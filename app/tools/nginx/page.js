'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const presets = [
  { label: 'Static Site', serverName: 'example.com', root: '/var/www/html', index: 'index.html', locations: [] },
  { label: 'Reverse Proxy', serverName: 'api.example.com', root: '', index: '', locations: [{ path: '/', proxy: 'http://localhost:3000' }] },
  { label: 'PHP App', serverName: 'app.example.com', root: '/var/www/html', index: 'index.php', locations: [{ path: '~ \.php$', proxy: 'unix:/var/run/php/php8.2-fpm.sock', extra: 'include fastcgi_params;' }] },
];

export default function NginxPage() {
  const { addEntry } = useHistory();
  const [serverName, setServerName] = useState('example.com');
  const [root, setRoot] = useState('/var/www/html');
  const [index, setIndex] = useState('index.html');
  const [locPath, setLocPath] = useState('/');
  const [locProxy, setLocProxy] = useState('');
  const [locations, setLocations] = useState([]);
  const [output, setOutput] = useState('');

  const addLocation = useCallback(() => {
    if (!locPath) return;
    setLocations(l => [...l, { path: locPath, proxy: locProxy }]);
    setLocPath('/');
    setLocProxy('');
  }, [locPath, locProxy]);

  const removeLocation = useCallback((i) => {
    setLocations(l => l.filter((_, idx) => idx !== i));
  }, []);

  const applyPreset = useCallback((p) => {
    setServerName(p.serverName);
    setRoot(p.root);
    setIndex(p.index);
    setLocations(p.locations.map(l => ({ path: l.path, proxy: l.proxy || '' })));
  }, []);

  const generate = useCallback(() => {
    const lines = [
      'server {',
      `  listen 80;`,
      `  server_name ${serverName};`,
      '',
    ];
    if (root) lines.push(`  root ${root};`);
    if (index) lines.push(`  index ${index};`);
    lines.push('');
    for (const loc of locations) {
      lines.push(`  location ${loc.path} {`);
      if (loc.proxy) lines.push(`    proxy_pass ${loc.proxy};`);
      lines.push('  }');
      lines.push('');
    }
    lines.push('}');
    setOutput(lines.join('\n'));
    addEntry('Nginx Config Builder');
  }, [serverName, root, index, locations, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">↗</span>
        <h1 className="font-heading text-2xl font-bold text-text">Nginx Config Builder</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <div className="flex gap-2 flex-wrap">
              {presets.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text transition-all cursor-pointer">{p.label}</button>
              ))}
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Server Name</label>
              <input value={serverName} onChange={(e) => setServerName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Root</label>
                <input value={root} onChange={(e) => setRoot(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2.5 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Index</label>
                <input value={index} onChange={(e) => setIndex(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2.5 py-1.5 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <label className="text-xs text-text-tertiary mb-2 block">Locations</label>
              {locations.map((l, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5 text-xs">
                  <span className="font-mono text-text-secondary">{l.path}</span>
                  {l.proxy && <span className="text-text-tertiary">→ {l.proxy}</span>}
                  <button onClick={() => removeLocation(i)} className="text-cat-text hover:text-cat-text/80 ml-auto cursor-pointer">✕</button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input value={locPath} onChange={(e) => setLocPath(e.target.value)} placeholder="/api"
                  className="flex-1 bg-surface rounded-lg px-2.5 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <input value={locProxy} onChange={(e) => setLocProxy(e.target.value)} placeholder="proxy_pass URL"
                  className="flex-[2] bg-surface rounded-lg px-2.5 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                <button onClick={addLocation} className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">+</button>
              </div>
            </div>
            <button onClick={generate} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Generate</button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">nginx.conf</span>
              {output && <CopyButton text={output} />}
            </div>
            <pre className="w-full bg-surface rounded-lg px-3 py-3 text-sm font-mono text-text border border-border whitespace-pre-wrap min-h-[300px]">{output || <span className="text-text-tertiary">Configure and generate...</span>}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
