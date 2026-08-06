'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const notes = [
  { name: 'C', freq: 261.63, type: 'white' },
  { name: 'C#', freq: 277.18, type: 'black' },
  { name: 'D', freq: 293.66, type: 'white' },
  { name: 'D#', freq: 311.13, type: 'black' },
  { name: 'E', freq: 329.63, type: 'white' },
  { name: 'F', freq: 349.23, type: 'white' },
  { name: 'F#', freq: 369.99, type: 'black' },
  { name: 'G', freq: 392.00, type: 'white' },
  { name: 'G#', freq: 415.30, type: 'black' },
  { name: 'A', freq: 440.00, type: 'white' },
  { name: 'A#', freq: 466.16, type: 'black' },
  { name: 'B', freq: 493.88, type: 'white' },
];

const keyLabels = {
  'C': 'a', 'C#': 'w', 'D': 's', 'D#': 'e', 'E': 'd', 'F': 'f',
  'F#': 't', 'G': 'g', 'G#': 'y', 'A': 'h', 'A#': 'u', 'B': 'j',
};

export default function PianoPage() {
  const { addEntry } = useHistory();
  const [octave, setOctave] = useState(4);
  const [activeNotes, setActiveNotes] = useState({});
  const [waveform, setWaveform] = useState('sine');
  const audioCtx = useRef(null);
  const oscillators = useRef({});

  const getCtx = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  };

  const playNote = useCallback((freq, name) => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (oscillators.current[name]) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = waveform;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start();
      oscillators.current[name] = { osc, gain };
      setActiveNotes((p) => ({ ...p, [name]: true }));
    } catch {}
  }, [waveform]);

  const stopNote = useCallback((name) => {
    if (oscillators.current[name]) {
      try { oscillators.current[name].gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.05); } catch {}
      setTimeout(() => {
        try { oscillators.current[name].osc.stop(); } catch {}
        delete oscillators.current[name];
        setActiveNotes((p) => ({ ...p, [name]: false }));
      }, 50);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.repeat) return;
      const entry = Object.entries(keyLabels).find(([, key]) => key === e.key.toLowerCase());
      if (entry) {
        const [name] = entry;
        const note = notes.find((n) => n.name === name);
        if (note) playNote(note.freq * Math.pow(2, octave - 4), name + octave);
      }
    };
    const handleKeyUp = (e) => {
      const entry = Object.entries(keyLabels).find(([, key]) => key === e.key.toLowerCase());
      if (entry) stopNote(entry[0] + octave);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    addEntry('Piano');
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
      Object.keys(oscillators.current).forEach((k) => {
        try { oscillators.current[k].osc.stop(); } catch {}
      });
      oscillators.current = {};
      if (audioCtx.current) audioCtx.current.close();
    };
  }, [octave, waveform, playNote, stopNote, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♫</span>
        <h1 className="font-heading text-2xl font-bold text-text">Piano</h1>
      </div>

      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-tertiary">Octave:</span>
              {[3, 4, 5].map((o) => (
                <button key={o} onClick={() => setOctave(o)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${octave === o ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{o}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Wave:</span>
              {['sine', 'triangle', 'sawtooth', 'square'].map((w) => (
                <button key={w} onClick={() => setWaveform(w)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-all cursor-pointer capitalize ${waveform === w ? 'bg-primary text-white' : 'bg-surface text-text-secondary border border-border hover:text-text'}`}>{w}</button>
              ))}
            </div>
          </div>

          <div className="relative h-48 select-none">
            <div className="absolute inset-0 flex">
              {notes.filter((n) => n.type === 'white').map((note) => {
                const name = note.name + octave;
                return (
                  <button key={name} onMouseDown={() => playNote(note.freq * Math.pow(2, octave - 4), name)} onMouseUp={() => stopNote(name)} onMouseLeave={() => stopNote(name)}
                    className={`flex-1 border border-border rounded-b-lg flex items-end justify-center pb-2 text-[10px] font-mono font-semibold transition-all ${
                      activeNotes[name] ? 'bg-primary/20 scale-[0.97]' : 'bg-white hover:bg-gray-50'
                    }`}
                    style={{ color: activeNotes[name] ? 'var(--primary)' : '#94a3b8', zIndex: 1 }}>
                    {note.name}{octave}
                    <span className="text-[8px] ml-1 opacity-50">{keyLabels[note.name]}</span>
                  </button>
                );
              })}
            </div>

            {notes.filter((n) => n.type === 'black').map((note, i) => {
              const whiteIdx = notes.findIndex((n) => n.type === 'white' && n.name > (i > 0 ? notes[notes.findLastIndex((n, idx) => idx < notes.indexOf(note) && n.type === 'white')]?.name || 'C' : 'C'));
              const name = note.name + octave;
              return (
                <button key={name} onMouseDown={() => playNote(note.freq * Math.pow(2, octave - 4), name)} onMouseUp={() => stopNote(name)} onMouseLeave={() => stopNote(name)}
                  className="absolute w-[7%] h-[65%] rounded-b-lg text-[8px] font-mono font-semibold transition-all flex items-end justify-center pb-1"
                  style={{
                    left: `${(i + 1) * (100 / 7) - 3.5}%`,
                    backgroundColor: activeNotes[name] ? '#475569' : '#1e293b',
                    color: activeNotes[name] ? '#94a3b8' : '#64748b',
                    zIndex: 2,
                    border: '1px solid #0f172a',
                  }}>
                  <span className="opacity-60">{keyLabels[note.name]}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-text-secondary text-center">
            Use keyboard keys {Object.values(keyLabels).slice(0, 7).join(', ')} etc. or click the keys
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
