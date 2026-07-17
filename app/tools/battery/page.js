'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(seconds) {
  if (!seconds || seconds === Infinity) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function BatteryPage() {
  const [info, setInfo] = useState(null);
  const [supported, setSupported] = useState(true);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    if (!navigator.getBattery) { setSupported(false); return; }
    let batteryObj = null;
    navigator.getBattery().then(battery => {
      batteryObj = battery;
      const update = () => {
        setInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
        setUpdated(new Date());
      };
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
      battery.addEventListener('chargingtimechange', update);
      battery.addEventListener('dischargingtimechange', update);
      return () => {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
        battery.removeEventListener('chargingtimechange', update);
        battery.removeEventListener('dischargingtimechange', update);
      };
    });
  }, []);

  if (!supported) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-cat-system">⚡</span>
          <h1 className="font-heading text-2xl font-bold text-text">Battery Info</h1>
        </div>
        <GlassCard>
          <div className="p-8 text-center text-text-tertiary text-sm">
            Battery API is not supported in this browser. Try Chrome or Edge.
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  if (!info) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-cat-system">⚡</span>
          <h1 className="font-heading text-2xl font-bold text-text">Battery Info</h1>
        </div>
        <GlassCard>
          <div className="p-8 text-center text-text-tertiary text-sm">Loading battery info...</div>
        </GlassCard>
      </motion.div>
    );
  }

  const chargeColor = info.level > 60 ? 'var(--cat-success)' : info.level > 20 ? 'var(--cat-media)' : 'var(--cat-text)';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">⚡</span>
        <h1 className="font-heading text-2xl font-bold text-text">Battery Info</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-text tabular-nums" style={{ color: chargeColor }}>{info.level}%</div>
            <div className="text-sm text-text-tertiary mt-1">{info.charging ? '⚡ Charging' : '🔋 Not charging'}</div>
          </div>
          <div className="w-full bg-surface rounded-full h-4 overflow-hidden border border-border">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${info.level}%`, backgroundColor: chargeColor }} />
          </div>
          {updated && (
            <div className="text-center text-[10px] text-text-tertiary">Updated {updated.toLocaleTimeString()}</div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Status', info.charging ? 'Charging' : 'Discharging'],
              ['Level', `${info.level}%`],
              ['Time to full', fmt(info.chargingTime)],
              ['Time to empty', fmt(info.dischargingTime)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface rounded-xl border border-border px-4 py-3">
                <div className="text-xs text-text-tertiary">{label}</div>
                <div className="text-base font-semibold text-text mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
