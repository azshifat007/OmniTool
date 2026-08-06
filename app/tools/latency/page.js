'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const speedOfLight = 299792458; // m/s

const distanceUnits = {
  km: { toMeters: (v) => v * 1000, label: 'km' },
  miles: { toMeters: (v) => v * 1609.344, label: 'mi' },
  'light-ms': { toMeters: (v) => v * speedOfLight / 1000, label: 'light-ms' },
};

const media = {
  'Fiber (vacuum)': { speed: speedOfLight, color: 'var(--color-cat-network)' },
  'Fiber (glass)': { speed: speedOfLight * 0.66, color: 'var(--color-primary)' },
  'Copper': { speed: speedOfLight * 0.59, color: 'var(--color-accent)' },
  'Radio': { speed: speedOfLight, color: 'var(--color-cat-success)' },
  'Satellite': { speed: speedOfLight, color: 'var(--color-cat-design)' },
};

const presets = [
  { label: 'NY → London', dist: 5570, unit: 'km' },
  { label: 'NY → LA', dist: 3944, unit: 'km' },
  { label: 'Earth → Moon', dist: 384400, unit: 'km' },
  { label: 'Earth → GEO Sat', dist: 35786, unit: 'km' },
];

function formatTime(seconds) {
  if (seconds >= 1) return `${seconds.toFixed(3)} s`;
  if (seconds >= 0.001) return `${(seconds * 1000).toFixed(2)} ms`;
  if (seconds >= 0.000001) return `${(seconds * 1000000).toFixed(2)} μs`;
  return `${(seconds * 1000000000).toFixed(2)} ns`;
}

export default function LatencyPage() {
  const { addEntry } = useHistory();
  const [distance, setDistance] = useState('');
  const [distUnit, setDistUnit] = useState('km');
  const [medium, setMedium] = useState('Fiber (glass)');

  const handlePreset = useCallback((p) => {
    setDistance(String(p.dist));
    setDistUnit(p.unit);
    addEntry('Latency Calculator');
  }, [addEntry]);

  const results = useMemo(() => {
    const d = parseFloat(distance);
    if (isNaN(d) || d <= 0) return null;
    const m = media[medium];
    const du = distanceUnits[distUnit];
    const meters = du.toMeters(d);
    const propDelay = meters / m.speed;
    const rtt = propDelay * 2;
    const minRtt = meters * 2 / speedOfLight;
    return {
      propDelay,
      propDelayFormatted: formatTime(propDelay),
      rtt,
      rttFormatted: formatTime(rtt),
      minRtt,
      minRttFormatted: formatTime(minRtt),
      medium,
      distance: d,
      unit: du.label,
      speed: m.speed,
      speedFrac: (m.speed / speedOfLight * 100).toFixed(0),
    };
  }, [distance, distUnit, medium]);

  const handleCalc = useCallback(() => {
    if (results) addEntry('Latency Calculator');
  }, [results, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-network">◉</span>
        <h1 className="font-heading text-2xl font-bold text-text">Latency Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Link Parameters</span>

            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => handlePreset(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    parseFloat(distance) === p.dist && distUnit === p.unit
                      ? 'bg-primary text-white'
                      : 'text-text-tertiary hover:text-text bg-surface border border-border'
                  }`}
                >{p.label}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Distance</label>
                <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g. 5570" min="0" step="any"
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Unit</label>
                <select value={distUnit} onChange={(e) => setDistUnit(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                  {Object.entries(distanceUnits).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">Medium</label>
              <select value={medium} onChange={(e) => setMedium(e.target.value)}
                className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {Object.keys(media).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <button onClick={handleCalc}
              className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
              Calculate Latency
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-4 space-y-4">
            <span className="text-xs text-text-tertiary block">Results</span>
            {results ? (
              <div className="space-y-3">
                <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-tertiary">Propagation Delay (One-Way)</span>
                    <span className="text-xs font-mono text-cat-network font-medium">{results.propDelayFormatted}</span>
                  </div>
                </div>

                <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-tertiary">Round-Trip Time (RTT)</span>
                    <span className="text-xs font-mono text-primary font-medium">{results.rttFormatted}</span>
                  </div>
                </div>

                <div className="bg-surface rounded-lg px-4 py-3 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-tertiary">Min. Theoretical RTT (vacuum)</span>
                    <span className="text-xs font-mono text-text-secondary font-medium">{results.minRttFormatted}</span>
                  </div>
                </div>

                <div className="bg-surface rounded-lg px-3 py-3 border border-border/50 space-y-1.5">
                  <div className="text-xs text-text-tertiary font-medium">Details</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <span className="text-text-tertiary">Distance</span>
                    <span className="font-mono text-text text-right">{results.distance} {results.unit}</span>
                    <span className="text-text-tertiary">Medium</span>
                    <span className="font-mono text-text text-right">{results.medium}</span>
                    <span className="text-text-tertiary">Signal speed</span>
                    <span className="font-mono text-text text-right">{results.speedFrac}% c</span>
                  </div>
                </div>

                <CopyButton text={
                  `Distance: ${results.distance} ${results.unit}\nMedium: ${results.medium}\nOne-Way: ${results.propDelayFormatted}\nRTT: ${results.rttFormatted}\nMin RTT: ${results.minRttFormatted}`
                } />
              </div>
            ) : (
              <div className="text-xs text-text-tertiary py-8 text-center">
                Enter distance and click Calculate Latency
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
