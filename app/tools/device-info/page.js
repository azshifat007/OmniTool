'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

function section(title, items) {
  return { title, items };
}

export default function DeviceInfoPage() {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    const n = navigator;
    const s = screen;
    const w = window;
    const d = document;
    setInfo([
      section('Browser', [
        ['User Agent', n.userAgent],
        ['Language', n.language],
        ['Platform', n.platform],
        ['Vendor', n.vendor],
        ['Cookies Enabled', n.cookieEnabled],
        ['Do Not Track', n.doNotTrack || 'unset'],
        ['Hardware Concurrency', n.hardwareConcurrency + ' cores'],
        ['Device Memory', n.deviceMemory ? n.deviceMemory + ' GB' : 'unknown'],
      ]),
      section('Screen', [
        ['Resolution', `${s.width} × ${s.height}`],
        ['Available', `${s.availWidth} × ${s.availHeight}`],
        ['Color Depth', s.colorDepth + ' bit'],
        ['Pixel Ratio', w.devicePixelRatio.toFixed(2) + 'x'],
        ['Orientation', s.orientation?.type || 'unknown'],
      ]),
      section('Window', [
        ['Viewport', `${w.innerWidth} × ${w.innerHeight}`],
        ['Scroll', `${w.scrollX}, ${w.scrollY}`],
      ]),
      section('Connection', [
        ['Effective Type', n.connection?.effectiveType || 'unknown'],
        ['Downlink', n.connection?.downlink ? n.connection.downlink + ' Mbps' : 'unknown'],
        ['RTT', n.connection?.rtt ? n.connection.rtt + ' ms' : 'unknown'],
        ['On Battery', n.getBattery ? 'checking...' : 'unknown'],
      ]),
      section('Location', [
        ['URL', d.URL],
        ['Origin', d.location.origin],
        ['Protocol', d.location.protocol],
        ['Host', d.location.host],
        ['Pathname', d.location.pathname],
      ]),
      section('Timing', [
        ['Page Loaded', d.readyState],
        ['DOM Ready', d.readyState === 'complete' ? 'complete' : 'loading'],
      ]),
    ]);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">ℹ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Device Info</h1>
      </div>
      {info.map(s => (
        <GlassCard key={s.title}>
          <div className="p-4">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">{s.title}</div>
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {s.items.map(([label, value]) => (
                <div key={label} className="flex border-b border-border/50 last:border-0">
                  <div className="w-36 shrink-0 px-3 py-2 text-xs font-medium text-text-tertiary">{label}</div>
                  <div className="flex-1 px-3 py-2 text-sm text-text font-mono break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ))}
    </motion.div>
  );
}
