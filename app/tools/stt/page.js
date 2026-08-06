'use client';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';

export default function STTPage() {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let final = '', interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interimText += e.results[i][0].transcript;
      }
      if (final) setText(prev => prev + final);
      setInterim(interimText);
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => { setListening(false); };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
  }, []);

  const clear = useCallback(() => { setText(''); setInterim(''); }, []);

  if (!supported) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-cat-media">♩</span>
          <h1 className="font-heading text-2xl font-bold text-text">Speech to Text</h1>
        </div>
        <GlassCard>
          <div className="p-8 text-center text-text-tertiary text-sm">
            Speech recognition is not supported in this browser. Try Chrome or Edge.
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♩</span>
        <h1 className="font-heading text-2xl font-bold text-text">Speech to Text</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <div className="flex justify-center gap-2">
            {!listening ? (
              <button onClick={start}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">
                🎤 Start Listening
              </button>
            ) : (
              <button onClick={stop}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-cat-text text-white hover:opacity-90 transition-all cursor-pointer">
                ⏹ Stop
              </button>
            )}
            <button onClick={clear} disabled={!text && !interim}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-surface text-text-secondary border border-border hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              Clear
            </button>
          </div>
          {listening && (
            <div className="flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-cat-text animate-pulse" />
              <span className="text-xs text-text-tertiary">Listening...</span>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-tertiary">Transcribed Text</label>
              {text && <CopyButton text={text} />}
            </div>
            <div className="w-full min-h-[200px] bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm outline-none whitespace-pre-wrap break-all">
              {text || ''}
              {interim && <span className="text-text-tertiary/60">{interim}</span>}
              {!text && !interim && <span className="text-text-tertiary">Tap "Start Listening" and speak...</span>}
            </div>
          </div>
          {text && <div className="text-xs text-text-tertiary text-right">{text.split(/\s+/).filter(Boolean).length} words</div>}
        </div>
      </GlassCard>
    </motion.div>
  );
}
