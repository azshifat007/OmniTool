'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const spinnerTypes = [
  { id: 'circle', label: 'Circle' },
  { id: 'dots', label: 'Dots' },
  { id: 'ring', label: 'Ring' },
  { id: 'dual-ring', label: 'Dual Ring' },
  { id: 'bars', label: 'Bars' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'hourglass', label: 'Hourglass' },
];

function SpinnerPreview({ type, color, size, speed }) {
  const s = size;
  const half = s / 2;
  const borderW = Math.max(2, Math.round(s / 8));

  const baseStyle = { width: s, height: s };

  switch (type) {
    case 'circle':
      return (
        <motion.div
          style={{
            ...baseStyle,
            border: `${borderW}px solid var(--color-border)`,
            borderTopColor: color,
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        />
      );
    case 'dots':
      return (
        <div style={{ display: 'flex', gap: Math.round(s / 6), alignItems: 'center', ...baseStyle }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{ width: s / 4, height: s / 4, backgroundColor: color, borderRadius: '50%' }}
              animate={{ y: [0, -(s / 6), 0] }}
              transition={{ repeat: Infinity, duration: speed, delay: i * speed / 3, ease: 'easeInOut' }}
            />
          ))}
        </div>
      );
    case 'ring':
      return (
        <motion.div
          style={{
            ...baseStyle,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${color}, transparent 60%, ${color})`,
            mask: 'radial-gradient(transparent 55%, #000 56%)',
            WebkitMask: 'radial-gradient(transparent 55%, #000 56%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        />
      );
    case 'dual-ring':
      return (
        <div style={{ position: 'relative', ...baseStyle }}>
          <motion.div
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `${borderW}px solid transparent`,
              borderTopColor: color, borderBottomColor: color,
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: speed * 0.7, ease: 'linear' }}
          />
          <motion.div
            style={{
              position: 'absolute', inset: borderW * 2, borderRadius: '50%',
              border: `${borderW}px solid transparent`,
              borderLeftColor: color, borderRightColor: color,
            }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
          />
        </div>
      );
    case 'bars':
      return (
        <div style={{ display: 'flex', gap: Math.round(s / 10), alignItems: 'center', ...baseStyle }}>
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              style={{ width: s / 8, height: s / 3, backgroundColor: color, borderRadius: 2 }}
              animate={{ scaleY: [1, 2, 1] }}
              transition={{ repeat: Infinity, duration: speed, delay: i * speed / 5, ease: 'easeInOut' }}
            />
          ))}
        </div>
      );
    case 'pulse':
      return (
        <motion.div
          style={{ ...baseStyle, backgroundColor: color, borderRadius: '50%' }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: speed, ease: 'easeInOut' }}
        />
      );
    case 'hourglass':
      return (
        <motion.div
          style={{ ...baseStyle, position: 'relative' }}
          animate={{ rotate: 180 }}
          transition={{ repeat: Infinity, duration: speed * 2, ease: 'easeInOut' }}
        >
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            border: `${borderW}px solid ${color}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '40%',
              backgroundColor: color, borderRadius: '0 0 50% 50%',
            }} />
          </div>
        </motion.div>
      );
    default:
      return null;
  }
}

function generateCss(type, color, size, speed) {
  const name = `spinner-${type}`;
  const s = size;
  const bw = Math.max(2, Math.round(s / 8));

  const keyframes = {
    circle: `@keyframes ${name} { to { transform: rotate(360deg); } }`,
    dots: `@keyframes ${name} { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-${Math.round(s / 6)}px); } }`,
    ring: `@keyframes ${name} { to { transform: rotate(360deg); } }`,
    'dual-ring': `@keyframes ${name}-outer { to { transform: rotate(360deg); } }\n@keyframes ${name}-inner { to { transform: rotate(-360deg); } }`,
    bars: `@keyframes ${name} { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(2); } }`,
    pulse: `@keyframes ${name} { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } }`,
    hourglass: `@keyframes ${name} { to { transform: rotate(180deg); } }`,
  };

  const cssBlocks = {
    circle: `${keyframes.circle}\n\n.spinner-${type} {\n  width: ${s}px;\n  height: ${s}px;\n  border: ${bw}px solid var(--color-border);\n  border-top-color: ${color};\n  border-radius: 50%;\n  animation: ${name} ${speed}s linear infinite;\n}`,
    dots: `${keyframes.dots}\n\n.spinner-${type} {\n  display: flex;\n  gap: ${Math.round(s / 6)}px;\n  align-items: center;\n}\n\n.spinner-${type} span {\n  width: ${Math.round(s / 4)}px;\n  height: ${Math.round(s / 4)}px;\n  background: ${color};\n  border-radius: 50%;\n  animation: ${name} ${speed}s ease-in-out infinite;\n}\n\n.spinner-${type} span:nth-child(2) { animation-delay: ${(speed / 3).toFixed(2)}s; }\n.spinner-${type} span:nth-child(3) { animation-delay: ${((speed / 3) * 2).toFixed(2)}s; }`,
    ring: `${keyframes.ring}\n\n.spinner-${type} {\n  width: ${s}px;\n  height: ${s}px;\n  border-radius: 50%;\n  background: conic-gradient(from 0deg, ${color}, transparent 60%, ${color});\n  -webkit-mask: radial-gradient(transparent 55%, #000 56%);\n  mask: radial-gradient(transparent 55%, #000 56%);\n  animation: ${name} ${speed}s linear infinite;\n}`,
    'dual-ring': `${keyframes}\n\n.spinner-${type} {\n  width: ${s}px;\n  height: ${s}px;\n  position: relative;\n}\n\n.spinner-${type}::before,\n.spinner-${type}::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: 50%;\n  border: ${bw}px solid transparent;\n}\n\n.spinner-${type}::before {\n  border-top-color: ${color};\n  border-bottom-color: ${color};\n  animation: ${name}-outer ${(speed * 0.7).toFixed(2)}s linear infinite;\n}\n\n.spinner-${type}::after {\n  inset: ${bw * 2}px;\n  border-left-color: ${color};\n  border-right-color: ${color};\n  animation: ${name}-inner ${speed}s linear infinite;\n}`,
    bars: `${keyframes.bars}\n\n.spinner-${type} {\n  display: flex;\n  gap: ${Math.round(s / 10)}px;\n  align-items: center;\n}\n\n.spinner-${type} span {\n  width: ${Math.round(s / 8)}px;\n  height: ${Math.round(s / 3)}px;\n  background: ${color};\n  border-radius: 2px;\n  animation: ${name} ${speed}s ease-in-out infinite;\n}\n\n.spinner-${type} span:nth-child(1) { animation-delay: 0s; }\n.spinner-${type} span:nth-child(2) { animation-delay: ${(speed / 5).toFixed(2)}s; }\n.spinner-${type} span:nth-child(3) { animation-delay: ${((speed / 5) * 2).toFixed(2)}s; }\n.spinner-${type} span:nth-child(4) { animation-delay: ${((speed / 5) * 3).toFixed(2)}s; }\n.spinner-${type} span:nth-child(5) { animation-delay: ${((speed / 5) * 4).toFixed(2)}s; }`,
    pulse: `${keyframes.pulse}\n\n.spinner-${type} {\n  width: ${s}px;\n  height: ${s}px;\n  background: ${color};\n  border-radius: 50%;\n  animation: ${name} ${speed}s ease-in-out infinite;\n}`,
    hourglass: `${keyframes.hourglass}\n\n.spinner-${type} {\n  width: ${s}px;\n  height: ${s}px;\n  position: relative;\n  animation: ${name} ${(speed * 2).toFixed(2)}s ease-in-out infinite;\n}\n\n.spinner-${type}::before {\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: 50%;\n  border: ${bw}px solid ${color};\n  overflow: hidden;\n}\n\n.spinner-${type}::after {\n  content: '';\n  position: absolute;\n  bottom: 0;\n  left: 10%;\n  right: 10%;\n  height: 40%;\n  background: ${color};\n  border-radius: 0 0 50% 50%;\n}`,
  };

  return cssBlocks[type] || '';
}

export default function SpinnerPage() {
  const { addEntry } = useHistory();
  const [type, setType] = useState('circle');
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(64);
  const [speed, setSpeed] = useState(1);

  const cssCode = generateCss(type, color, size, speed);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-design">⟳</span>
        <h1 className="font-heading text-2xl font-bold text-text">Loading Spinner Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <GlassCard>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-text-tertiary mb-3 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {spinnerTypes.map((t) => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        type === t.id ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text bg-surface border border-border'
                      }`}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Color</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border cursor-pointer bg-transparent" />
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Size: {size}px</label>
                <input type="range" min={24} max={120} value={size} onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
                <div className="flex justify-between text-[10px] text-text-secondary"><span>24px</span><span>120px</span></div>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-2 block">Speed: {speed.toFixed(2)}s</label>
                <input type="range" min={0.25} max={3} step={0.05} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
                <div className="flex justify-between text-[10px] text-text-secondary"><span>0.25s</span><span>3s</span></div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <div className="p-4">
              <label className="text-xs text-text-tertiary mb-4 block">Live Preview</label>
              <div className="w-full h-48 bg-surface rounded-xl border border-border/50 flex items-center justify-center">
                <SpinnerPreview type={type} color={color} size={size} speed={speed} />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-tertiary">CSS Code</span>
                <CopyButton text={cssCode} />
              </div>
              <pre className="bg-surface rounded-lg px-3 py-3 text-xs font-mono text-text border border-border/50 overflow-auto whitespace-pre max-h-64">{cssCode}</pre>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
