'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const COMMANDS = [
  { label: 'Remove all stopped containers', cmd: 'docker container prune -f' },
  { label: 'Remove unused images', cmd: 'docker image prune -a -f' },
  { label: 'Remove unused volumes', cmd: 'docker volume prune -a -f' },
  { label: 'Remove unused networks', cmd: 'docker network prune -f' },
  { label: 'Remove all build cache', cmd: 'docker builder prune -a -f' },
  { label: 'Full system cleanup', cmd: 'docker system prune -a --volumes -f' },
  { label: 'Remove dangling images', cmd: 'docker image prune -f' },
  { label: 'Stop all running containers', cmd: 'docker stop $(docker ps -q)' },
  { label: 'Remove all containers (even running)', cmd: 'docker rm -f $(docker ps -aq)' },
  { label: 'Remove all images', cmd: 'docker rmi -f $(docker images -q)' },
];

export default function DockerCleanPage() {
  const { addEntry } = useHistory();
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState('');

  const handleSelect = useCallback((cmd) => {
    setSelected(cmd);
    setCustom(cmd);
    addEntry('Docker Cleanup');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">Docker Cleanup</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-secondary">Quick commands for Docker system cleanup and maintenance.</p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {COMMANDS.map(c => (
                <button key={c.label} onClick={() => handleSelect(c.cmd)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer ${selected === c.cmd ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-secondary hover:text-text hover:border-primary'}`}>
                  <span className="font-medium">{c.label}</span>
                  <span className="block font-mono text-[10px] mt-0.5 opacity-70">{c.cmd}</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-3">
            <span className="text-xs text-text-tertiary block">Command</span>
            <div>
              <label className="text-[10px] text-text-tertiary mb-1 block">Edit or write custom</label>
              <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={3}
                className="w-full bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
            </div>
            {custom && (
              <>
                <pre className="bg-surface rounded-xl p-3 text-xs font-mono text-text border border-border/50 whitespace-pre-wrap">{custom}</pre>
                <div className="flex"><CopyButton text={custom} className="text-xs" /></div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
