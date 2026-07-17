'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function AudioRecorderPage() {
  const { addEntry } = useHistory();
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [level, setLevel] = useState(0);
  const [quality, setQuality] = useState('audio/webm');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported(quality) ? quality : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorder.current = recorder;
      chunks.current = [];

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.analyser.getByteTimeDomainData(analyserRef.current.data);
        let sum = 0;
        for (const v of analyserRef.current.data) sum += Math.abs(v - 128);
        setLevel(Math.min(100, (sum / analyserRef.current.data.length) * 1.5));
        requestAnimationFrame(tick);
      };
      tick();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType });
        setBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        setDuration(0);
        setLevel(0);
        if (analyserRef.current) { analyserRef.current.ctx.close(); analyserRef.current = null; }
      };

      recorder.start();
      setRecording(true);
      addEntry('Audio Recorder');

      let sec = 0;
      timerRef.current = setInterval(() => { sec++; setDuration(sec); }, 1000);
    } catch (e) {
      setError(e.message || 'Microphone access denied');
    }
  }, [addEntry, quality]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }, []);

  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString().slice(0, 19)}.${blob.type.includes('webm') ? 'webm' : 'mp4'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-media">♪</span>
        <h1 className="font-heading text-2xl font-bold text-text">Audio Recorder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <div className="p-6 flex flex-col items-center gap-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                recording ? 'bg-cat-text/20 animate-pulse' : 'bg-surface border-2 border-border'
              }`}>
                <motion.div animate={{ scale: recording ? [1, 1.15, 1] : 1 }} transition={{ repeat: recording ? Infinity : 0, duration: 1.2 }}>
                  <span className={`text-5xl ${recording ? 'text-cat-text' : 'text-text-secondary'}`}>♪</span>
                </motion.div>
              </div>
              {recording && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cat-text animate-pulse" />}
            </div>

            <div className="text-4xl font-mono font-bold text-text">{formatTime(duration)}</div>

            <div className="w-full max-w-[200px] h-2 bg-surface rounded-full overflow-hidden border border-border/50">
              <div className="h-full bg-cat-media transition-all" style={{ width: `${level}%` }} />
            </div>

            <button onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full text-sm font-bold transition-all cursor-pointer shadow-lg ${
                recording ? 'bg-cat-text text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-dark'
              }`}>
              {recording ? '■' : '▶'}
            </button>

            {!recording && (
              <select value={quality} onChange={(e) => setQuality(e.target.value)}
                className="bg-surface rounded-lg px-3 py-1.5 text-xs text-text border border-border focus:border-primary focus:outline-none transition-colors cursor-pointer">
                {['audio/webm', 'audio/mp4', 'audio/ogg'].map(q => (
                  <option key={q} value={q}>{q.split('/')[1].toUpperCase()}</option>
                ))}
              </select>
            )}

            {error && <div className="text-xs text-cat-text">{error}</div>}
          </div>
        </GlassCard>

        <div className="space-y-4">
          {blob && (
            <GlassCard>
              <div className="p-4 space-y-3">
                <span className="text-xs text-text-tertiary">Recording</span>
                <audio ref={audioRef} controls src={URL.createObjectURL(blob)} className="w-full" />
                <div className="flex gap-2">
                  <button onClick={download} className="flex-1 rounded-xl px-4 py-2 text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Download</button>
                  <button onClick={() => setBlob(null)} className="px-4 py-2 text-xs font-medium rounded-xl bg-surface text-text-secondary border border-border hover:text-text transition-all cursor-pointer">Discard</button>
                </div>
                <div className="text-[10px] text-text-secondary font-mono">{(blob.size / 1024).toFixed(1)} KB · {blob.type}</div>
              </div>
            </GlassCard>
          )}

          <GlassCard>
            <div className="p-4">
              <span className="text-xs text-text-tertiary mb-3 block">Info</span>
              <div className="space-y-1 text-[11px] text-text-secondary leading-relaxed">
                <div>• Records from your microphone</div>
                <div>• Live input level meter</div>
                <div>• All processing is local</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
