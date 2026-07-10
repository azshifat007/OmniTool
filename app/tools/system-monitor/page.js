'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function SystemMonitorPage() {
  const { addEntry } = useHistory();
  const [info, setInfo] = useState(null);
  const [memory, setMemory] = useState(null);
  const [battery, setBattery] = useState(null);
  const connRef = useRef(null);

  useEffect(() => {
    addEntry('System Monitor');
    const nav = navigator;
    const con = nav.connection || nav.mozConnection || nav.webkitConnection;
    connRef.current = con;

    const updateBattery = async () => {
      try {
        const bat = await nav.getBattery();
        setBattery({ level: bat.level * 100, charging: bat.charging });
      } catch { setBattery(null); }
    };

    setInfo({
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      languages: nav.languages?.join(', '),
      cookies: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack,
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory || 'unknown',
      vendor: nav.vendor,
      maxTouchPoints: nav.maxTouchPoints,
      online: nav.onLine,
    });

    if (con) {
      setMemory({
        type: con.type || 'unknown',
        downlink: con.downlink,
        downlinkMax: con.downlinkMax,
        effectiveType: con.effectiveType,
        rtt: con.rtt,
        saveData: con.saveData,
      });
    }

    if ('getBattery' in nav) updateBattery();

    const onMemChange = () => {
      if (connRef.current) {
        setMemory({
          type: connRef.current.type || 'unknown',
          downlink: connRef.current.downlink,
          downlinkMax: connRef.current.downlinkMax,
          effectiveType: connRef.current.effectiveType,
          rtt: connRef.current.rtt,
          saveData: connRef.current.saveData,
        });
      }
    };
    if (con) con.addEventListener('change', onMemChange);
    return () => { if (con) con.removeEventListener('change', onMemChange); };
  }, [addEntry]);

  const screenW = typeof window !== 'undefined' ? window.screen.width : 0;
  const screenH = typeof window !== 'undefined' ? window.screen.height : 0;
  const availW = typeof window !== 'undefined' ? window.screen.availWidth : 0;
  const availH = typeof window !== 'undefined' ? window.screen.availHeight : 0;
  const colorDepth = typeof window !== 'undefined' ? window.screen.colorDepth : 0;
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 0;
  const windowW = typeof window !== 'undefined' ? window.innerWidth : 0;
  const windowH = typeof window !== 'undefined' ? window.innerHeight : 0;

  const StatCard = ({ label, value, large }) => (
    <div className="bg-surface rounded-lg px-3 py-2 border border-border/50">
      <div className="text-xs text-text-tertiary">{label}</div>
      <div className={`${large ? 'text-sm' : 'text-xs'} font-mono text-text font-medium mt-0.5 break-all`}>{value ?? '—'}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">📊</span>
        <h1 className="font-heading text-2xl font-bold text-text">System Monitor</h1>
      </div>

      <div className="space-y-5">
        <GlassCard>
          <div className="p-4">
            <span className="text-xs font-bold text-cat-system mb-3 block">Display</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatCard label="Resolution" value={`${screenW}×${screenH}`} />
              <StatCard label="Available" value={`${availW}×${availH}`} />
              <StatCard label="Color Depth" value={`${colorDepth}-bit`} />
              <StatCard label="Pixel Ratio" value={pixelRatio} />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4">
            <span className="text-xs font-bold text-cat-date mb-3 block">Viewport</span>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Window Size" value={`${windowW}×${windowH}`} />
              <StatCard label="Online" value={info?.online ? 'Yes' : 'No'} />
            </div>
          </div>
        </GlassCard>

        {info && (
          <GlassCard>
            <div className="p-4">
              <span className="text-xs font-bold text-cat-code mb-3 block">Browser & Hardware</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatCard label="Platform" value={info.platform} />
                <StatCard label="CPUs (logical)" value={info.hardwareConcurrency} />
                <StatCard label="RAM" value={info.deviceMemory !== 'unknown' ? `${info.deviceMemory} GB` : 'unknown'} />
                <StatCard label="Language" value={info.language} />
                <StatCard label="Vendor" value={info.vendor} />
                <StatCard label="Touch Points" value={info.maxTouchPoints} />
                <StatCard label="Cookies Enabled" value={info.cookies ? 'Yes' : 'No'} />
                <StatCard label="Do Not Track" value={info.doNotTrack || 'unspecified'} />
                <StatCard label="User Agent" value={info.userAgent} large />
              </div>
            </div>
          </GlassCard>
        )}

        {memory && (
          <GlassCard>
            <div className="p-4">
              <span className="text-xs font-bold text-cat-network mb-3 block">Network</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatCard label="Connection" value={memory.type} />
                <StatCard label="Effective Type" value={memory.effectiveType} />
                <StatCard label="Downlink" value={`${memory.downlink} Mbps`} />
                <StatCard label="Max Downlink" value={`${memory.downlinkMax} Mbps`} />
                <StatCard label="RTT" value={`${memory.rtt} ms`} />
                <StatCard label="Save Data" value={memory.saveData ? 'On' : 'Off'} />
              </div>
            </div>
          </GlassCard>
        )}

        {battery && (
          <GlassCard>
            <div className="p-4">
              <span className="text-xs font-bold text-cat-success mb-3 block">Battery</span>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Level" value={`${Math.round(battery.level)}%`} />
                <StatCard label="Status" value={battery.charging ? 'Charging' : 'Discharging'} />
              </div>
              {!battery.charging && (
                <div className="mt-3 bg-surface rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-cat-success rounded-full transition-all" style={{ width: `${battery.level}%` }} />
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
