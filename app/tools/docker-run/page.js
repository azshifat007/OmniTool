'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function DockerRunPage() {
  const { addEntry } = useHistory();
  const [image, setImage] = useState('nginx:latest');
  const [containerName, setContainerName] = useState('');
  const [ports, setPorts] = useState([{ host: '80', container: '80' }]);
  const [volumes, setVolumes] = useState([{ host: '', container: '' }]);
  const [envs, setEnvs] = useState([{ key: '', val: '' }]);
  const [detach, setDetach] = useState(true);
  const [restart, setRestart] = useState('no');
  const [net, setNet] = useState('');

  const addPair = (arr, setter, empty) => setter([...arr, { ...empty }]);
  const removePair = (arr, setter, i) => { if (arr.length > 1) setter(arr.filter((_, j) => j !== i)); };
  const updatePair = (arr, setter, i, field, val) => {
    const next = [...arr];
    next[i] = { ...next[i], [field]: val };
    setter(next);
  };

  const genCmd = useCallback(() => {
    addEntry('Docker Run Generator');
    const parts = ['docker run'];
    if (detach) parts.push('-d');
    if (containerName.trim()) parts.push(`--name ${containerName.trim()}`);
    ports.forEach(p => { if (p.host.trim() && p.container.trim()) parts.push(`-p ${p.host.trim()}:${p.container.trim()}`); });
    volumes.forEach(v => { if (v.host.trim() && v.container.trim()) parts.push(`-v ${v.host.trim()}:${v.container.trim()}`); });
    envs.forEach(e => { if (e.key.trim()) parts.push(`-e ${e.key.trim()}=${e.val.trim()}`); });
    if (restart !== 'no') parts.push(`--restart ${restart}`);
    if (net.trim()) parts.push(`--network ${net.trim()}`);
    parts.push(image.trim() || 'nginx:latest');
    return parts.join(' \\\n  ');
  }, [image, containerName, ports, volumes, envs, detach, restart, net, addEntry]);

  const cmd = genCmd();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Docker Run Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Image</label>
              <input value={image} onChange={(e) => setImage(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Container Name</label>
              <input value={containerName} onChange={(e) => setContainerName(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Ports</label>
              {ports.map((p, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={p.host} onChange={(e) => updatePair(ports, setPorts, i, 'host', e.target.value)} placeholder="Host"
                    className="w-20 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <span className="text-text-tertiary self-center">:</span>
                  <input value={p.container} onChange={(e) => updatePair(ports, setPorts, i, 'container', e.target.value)} placeholder="Container"
                    className="w-20 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => removePair(ports, setPorts, i)} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === ports.length - 1 && <button onClick={() => addPair(ports, setPorts, { host: '', container: '' })} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Volumes</label>
              {volumes.map((v, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={v.host} onChange={(e) => updatePair(volumes, setVolumes, i, 'host', e.target.value)} placeholder="Host path"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <span className="text-text-tertiary self-center">:</span>
                  <input value={v.container} onChange={(e) => updatePair(volumes, setVolumes, i, 'container', e.target.value)} placeholder="Container path"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => removePair(volumes, setVolumes, i)} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === volumes.length - 1 && <button onClick={() => addPair(volumes, setVolumes, { host: '', container: '' })} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Environment Variables</label>
              {envs.map((e, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={e.key} onChange={(e2) => updatePair(envs, setEnvs, i, 'key', e2.target.value)} placeholder="KEY"
                    className="w-28 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <span className="text-text-tertiary self-center">=</span>
                  <input value={e.val} onChange={(e2) => updatePair(envs, setEnvs, i, 'val', e2.target.value)} placeholder="value"
                    className="flex-1 bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
                  <button onClick={() => removePair(envs, setEnvs, i)} className="text-cat-text text-xs px-1 cursor-pointer">✕</button>
                  {i === envs.length - 1 && <button onClick={() => addPair(envs, setEnvs, { key: '', val: '' })} className="text-primary text-xs px-1 cursor-pointer">+</button>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Detach</label>
                <button onClick={() => setDetach(!detach)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${detach ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{detach ? 'Yes' : 'No'}</button>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Restart</label>
                <select value={restart} onChange={(e) => setRestart(e.target.value)}
                  className="bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  <option value="no">no</option><option value="always">always</option><option value="on-failure">on-failure</option><option value="unless-stopped">unless-stopped</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Network</label>
                <input value={net} onChange={(e) => setNet(e.target.value)} placeholder="bridge"
                  className="w-full bg-surface rounded-lg px-2 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-tertiary">Generated Command</span>
              <CopyButton text={cmd} className="text-xs" />
            </div>
            <pre className="bg-surface rounded-xl p-4 text-xs font-mono text-text leading-relaxed overflow-x-auto whitespace-pre-wrap border border-border/50">{cmd}</pre>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
