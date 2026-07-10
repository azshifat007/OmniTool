'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const PRESETS = [
  { label: 'Build Passing', left: 'build', right: 'passing', color: 'brightgreen' },
  { label: 'Build Failing', left: 'build', right: 'failing', color: 'red' },
  { label: 'Tests Passing', left: 'tests', right: 'passing', color: 'success' },
  { label: 'Coverage 90%', left: 'coverage', right: '90%', color: 'green' },
  { label: 'Version 1.0.0', left: 'version', right: '1.0.0', color: 'blue' },
  { label: 'License MIT', left: 'license', right: 'MIT', color: 'blueviolet' },
  { label: 'Docker Build', left: 'docker', right: 'passing', color: 'informational' },
  { label: 'Deployed', left: 'deploy', right: ' ✓', color: 'success' },
];

export default function CiBadgePage() {
  const { addEntry } = useHistory();
  const [left, setLeft] = useState('build');
  const [right, setRight] = useState('passing');
  const [color, setColor] = useState('brightgreen');
  const [style, setStyle] = useState('flat');
  const [logo, setLogo] = useState('');

  const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(left)}-${encodeURIComponent(right)}-${color}?style=${style}${logo ? '&logo=' + encodeURIComponent(logo) : ''}`;
  const md = `![${left}](${badgeUrl})`;
  const html = `<img alt="${left}" src="${badgeUrl}">`;

  const applyPreset = useCallback((p) => {
    setLeft(p.left);
    setRight(p.right);
    setColor(p.color);
    addEntry('CI Badge Generator');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">⎈</span>
        <h1 className="font-heading text-2xl font-bold text-text">CI Badge Generator</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs text-text-tertiary mb-2 block">Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className="px-2 py-1 text-[10px] font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text hover:border-primary transition-all cursor-pointer">{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Label (left)</label>
                <input value={left} onChange={(e) => setLeft(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Message (right)</label>
                <input value={right} onChange={(e) => setRight(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Color</label>
                <input value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-surface rounded-lg px-2 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors">
                  <option value="flat">flat</option><option value="flat-square">flat-square</option>
                  <option value="plastic">plastic</option><option value="for-the-badge">for-the-badge</option>
                  <option value="social">social</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Logo</label>
                <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="github"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-center bg-surface rounded-xl p-4 border border-border/50 min-h-[60px]">
              <img src={badgeUrl} alt="badge" className="max-w-full" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary">Markdown</span>
                <CopyButton text={md} className="text-xs" />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border/50 overflow-x-auto">{md}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary">HTML</span>
                <CopyButton text={html} className="text-xs" />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border/50 overflow-x-auto">{html}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary">URL</span>
                <CopyButton text={badgeUrl} className="text-xs" />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-2 text-xs font-mono text-text border border-border/50 overflow-x-auto break-all">{badgeUrl}</pre>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
