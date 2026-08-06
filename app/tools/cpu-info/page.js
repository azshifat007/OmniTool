'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function CpuInfoPage() {
  const { addEntry } = useHistory();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    addEntry('CPU Info');
    const nav = navigator;
    setInfo({
      cores: nav.hardwareConcurrency || 'Unknown',
      memory: nav.deviceMemory || 'Not available',
      platform: nav.platform || 'Unknown',
      userAgent: nav.userAgent || 'Unknown',
      language: nav.language || 'Unknown',
      languages: nav.languages || [],
      cookiesEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack || 'Not set',
      maxTouchPoints: nav.maxTouchPoints || 0,
      webdriver: nav.webdriver || false,
    });
  }, [addEntry]);

  if (!info) return null;

  const rows = [
    { label: 'CPU Cores', value: info.cores, icon: '⚙' },
    { label: 'Device Memory', value: info.memory === 'Not available' ? info.memory : `${info.memory} GB`, icon: '💾' },
    { label: 'Platform', value: info.platform, icon: '🖥' },
    { label: 'Browser', value: browser, icon: '🌐' },
    { label: 'Engine', value: engine, icon: '🔧' },
    { label: 'Language', value: info.language, icon: '🌐' },
    { label: 'Languages', value: info.languages.join(', '), icon: '🌍' },
    { label: 'Max Touch Points', value: info.maxTouchPoints, icon: '👆' },
    { label: 'Cookies Enabled', value: info.cookiesEnabled ? 'Yes' : 'No', icon: '🍪' },
    { label: 'Do Not Track', value: info.doNotTrack, icon: '🚫' },
    { label: 'WebDriver', value: info.webdriver ? 'Yes' : 'No', icon: '🤖' },
  ];

  const engine = /Edg\//.test(info.userAgent) ? 'EdgeHTML / Blink'
    : /Chrome\//.test(info.userAgent) ? 'Blink'
    : /Firefox\//.test(info.userAgent) ? 'Gecko'
    : /Safari\//.test(info.userAgent) ? 'WebKit' : 'Unknown';
  const browser = /Edg\//.test(info.userAgent) ? 'Edge'
    : /OPR\//.test(info.userAgent) || /Opera/.test(info.userAgent) ? 'Opera'
    : /Chrome\//.test(info.userAgent) ? 'Chrome'
    : /Firefox\//.test(info.userAgent) ? 'Firefox'
    : /Safari\//.test(info.userAgent) ? 'Safari' : 'Unknown';

  const copyUA = () => navigator.clipboard.writeText(info.userAgent);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⚙</span>
        <h1 className="font-heading text-2xl font-bold text-text">CPU Info</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rows.map(r => (
              <div key={r.label} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                <span className="text-lg w-8 text-center">{r.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs text-text-tertiary">{r.label}</div>
                  <div className="text-sm font-medium text-text truncate">{String(r.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mt-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-text-tertiary">User Agent</div>
            <button onClick={copyUA}
              className="text-xs font-medium rounded-lg bg-surface border border-border px-2 py-1 text-text-secondary hover:text-text transition-colors cursor-pointer">
              Copy UA
            </button>
          </div>
          <div className="text-xs font-mono text-text-secondary break-all bg-surface rounded-lg p-3 border border-border">
            {info.userAgent}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
