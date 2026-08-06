'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

function detect(ua) {
  const get = (re) => { const m = ua.match(re); return m ? m[1] : null; };

  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'Safari';
  else if (/Trident\/|MSIE/.test(ua)) browser = 'Internet Explorer';
  const browserVersion = get(/(?:Edg|OPR|Chrome|Firefox|Safari|Version|MSIE)\/?\s*(\d+[\d.]*)/) || '?';

  let os = 'Unknown';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/(iPhone|iPad|iPod)/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  const osVersion = get(/Windows NT (\d+\.\d+)|Android (\d+[\d.]*)|OS X (\d+[_\d.]*)|iPhone OS (\d+[_\d.]*)/);

  let device = 'Desktop';
  if (/(iPad|Tablet|Kindle)/.test(ua)) device = 'Tablet';
  else if (/(iPhone|Android.*Mobile|Windows Phone)/.test(ua)) device = 'Mobile';
  else if (/TV|SmartTV|CrKey/.test(ua)) device = 'TV';

  let engine = 'Unknown';
  if (/Gecko\//.test(ua) && /Firefox/.test(ua)) engine = 'Gecko';
  else if (/AppleWebKit/.test(ua)) engine = /Chrome\//.test(ua) ? 'Blink' : 'WebKit';
  else if (/Trident\//.test(ua)) engine = 'Trident';
  else if (/Edge\//.test(ua)) engine = 'EdgeHTML';

  const bot = /(bot|crawler|spider|slurp|mediapartners|bingpreview|facebookexternalhit)/i.test(ua);

  return { browser, browserVersion, os, osVersion, device, engine, bot };
}

const SAMPLE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default function UserAgentParserPage() {
  const { addEntry } = useHistory();
  const [ua, setUa] = useState(SAMPLE);

  const result = useMemo(() => detect(ua), [ua]);
  const rows = [
    ['Browser', `${result.browser} ${result.browserVersion}`],
    ['Operating System', result.osVersion ? `${result.os} ${result.osVersion.replace(/_/g, '.')}` : result.os],
    ['Device Type', result.device],
    ['Rendering Engine', result.engine],
    ['Bot / Crawler', result.bot ? 'Yes' : 'No'],
  ];

  const onChange = (e) => { setUa(e.target.value); addEntry('User-Agent Parser'); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">🌐</span>
        <h1 className="font-heading text-2xl font-bold text-text">User-Agent Parser</h1>
      </div>

      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Parse a User-Agent string into browser, OS, device and engine.</p>

          <div>
            <label className="text-xs text-text-tertiary block mb-2">User-Agent String</label>
            <textarea value={ua} onChange={onChange} rows={3}
              className="w-full bg-surface rounded-xl px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none resize-none leading-relaxed" />
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {rows.map(([label, value]) => (
              <div key={label} className="flex border-b border-border/50 last:border-0">
                <div className="w-40 shrink-0 px-3 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wide bg-badge-bg/50">{label}</div>
                <div className="flex-1 px-3 py-2 text-sm text-text font-mono break-all">{value}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <CopyButton text={rows.map(([l, v]) => `${l}: ${v}`).join('\n')} className="text-xs" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
