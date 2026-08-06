'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

export default function TTSPage() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback(() => {
    if (!text.trim() || !supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = voices.find(v => v.name === selectedVoice) || null;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [text, selectedVoice, rate, pitch, voices, supported]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  if (!supported) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-cat-media">♫</span>
          <h1 className="font-heading text-2xl font-bold text-text">Text to Speech</h1>
        </div>
        <GlassCard>
          <div className="p-8 text-center text-text-tertiary text-sm">
            Speech synthesis is not supported in this browser. Try Chrome or Edge.
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♫</span>
        <h1 className="font-heading text-2xl font-bold text-text">Text to Speech</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Text</label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Type or paste text to speak aloud..."
              rows={5}
              className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm resize-none outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Voice</label>
              <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
                className="w-full bg-surface text-text rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors cursor-pointer">
                <option value="">Default</option>
                {voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Rate: {rate}x</label>
              <input type="range" min={0.5} max={2} step={0.1} value={rate}
                onChange={e => setRate(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Pitch: {pitch}</label>
              <input type="range" min={0.5} max={2} step={0.1} value={pitch}
                onChange={e => setPitch(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={speak} disabled={!text.trim() || speaking}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              {speaking ? 'Speaking...' : 'Speak'}
            </button>
            <button onClick={stop} disabled={!speaking}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Stop
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
