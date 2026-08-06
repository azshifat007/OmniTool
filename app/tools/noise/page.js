'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const NOISE_TYPES = [
  { id: 'white', label: 'White', desc: 'Flat across all frequencies' },
  { id: 'pink', label: 'Pink', desc: 'Equal power per octave, natural' },
  { id: 'brown', label: 'Brown', desc: 'Deeper, more bass-heavy' },
];

export default function NoisePage() {
  const { addEntry } = useHistory();
  const [type, setType] = useState('white');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const createNoise = useCallback((ctx, noiseType) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (noiseType === 'white') {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (noiseType === 'pink') {
      const b = [0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b[0] = 0.99886 * b[0] + white * 0.0555179;
        b[1] = 0.99332 * b[1] + white * 0.0750759;
        b[2] = 0.969 * b[2] + white * 0.153852;
        b[3] = 0.8665 * b[3] + white * 0.3104856;
        b[4] = 0.55 * b[4] + white * 0.5329522;
        b[5] = -0.7616 * b[5] - white * 0.016898;
        data[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362) * 0.11;
        b[6] = white * 0.115926;
      }
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    return buffer;
  }, []);

  const start = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    gainRef.current = ctx.createGain();
    gainRef.current.gain.value = volume / 100;
    gainRef.current.connect(ctx.destination);

    analyserRef.current = ctx.createAnalyser();
    analyserRef.current.fftSize = 256;
    gainRef.current.connect(analyserRef.current);

    const buffer = createNoise(ctx, type);
    sourceRef.current = ctx.createBufferSource();
    sourceRef.current.buffer = buffer;
    sourceRef.current.loop = true;
    sourceRef.current.connect(gainRef.current);
    sourceRef.current.start();

    setPlaying(true);
    addEntry('Noise Generator');
    drawWaveform();
  }, [type, volume, addEntry, createNoise]);

  const stop = useCallback(() => {
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch {} sourceRef.current.disconnect(); sourceRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setPlaying(false);
  }, []);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const slice = w / data.length;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] / 128) * h / 2;
        const x = i * slice;
        const y = h / 2 - v + h / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    draw();
  };

  useEffect(() => {
    return () => { stop(); if (ctxRef.current) ctxRef.current.close(); };
  }, [stop]);

  const handleVolume = (val) => {
    const v = parseInt(val);
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v / 100;
  };

  const handleType = (t) => {
    setType(t);
    if (playing) { stop(); setTimeout(() => start(), 50); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♪</span>
        <h1 className="font-heading text-2xl font-bold text-text">Noise Generator</h1>
      </div>

      <GlassCard>
        <div className="p-6 space-y-6">
          <div className="flex justify-center gap-3">
            {NOISE_TYPES.map((n) => (
              <button key={n.id} onClick={() => handleType(n.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  type === n.id ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'
                }`}>
                {n.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-text-tertiary text-center">
            {NOISE_TYPES.find((n) => n.id === type)?.desc}
          </p>

          <div>
            <label className="text-xs text-text-tertiary mb-2 block">Volume: {volume}%</label>
            <input type="range" min={0} max={100} value={volume} onChange={(e) => handleVolume(e.target.value)}
              className="w-full accent-primary" />
          </div>

          <canvas ref={canvasRef} width={600} height={120}
            className="w-full h-24 rounded-xl bg-surface border border-border" />

          <div className="flex justify-center">
            <button onClick={playing ? stop : start}
              className={`w-28 h-28 rounded-full text-base font-bold transition-all cursor-pointer shadow-lg ${
                playing ? 'bg-cat-text text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-dark'
              }`}>
              {playing ? 'STOP' : 'PLAY'}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
