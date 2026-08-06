'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function ScreenRecorderPage() {
  const { addEntry } = useHistory();
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const start = useCallback(async () => {
    setError('');
    setBlob(null);
    addEntry('Screen Recorder');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' }, audio: true });
      chunks.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm' });
      mediaRecorder.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = () => {
        const b = new Blob(chunks.current, { type: 'video/webm' });
        setBlob(b);
        setRecording(false);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch (e) {
      if (e.name === 'NotAllowedError') setError('Screen capture was cancelled or denied.');
      else setError('Error: ' + e.message);
    }
  }, [addEntry]);

  const stop = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">📹</span>
        <h1 className="font-heading text-2xl font-bold text-text">Screen Recorder</h1>
      </div>
      <GlassCard>
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <p className="text-sm text-text-secondary text-center">Record your screen, a window, or a browser tab. Includes audio.</p>
          <div className="flex justify-center gap-3">
            {!recording ? (
              <button onClick={start} className="px-6 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white" /> Start Recording
              </button>
            ) : (
              <button onClick={stop} className="px-6 py-3 text-sm font-semibold rounded-xl bg-cat-text text-white hover:opacity-90 transition-all cursor-pointer flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /> Stop Recording
              </button>
            )}
          </div>
          {error && <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">{error}</div>}
          {recording && (
            <div className="flex items-center justify-center gap-2 text-cat-text text-sm">
              <span className="w-2 h-2 rounded-full bg-cat-text animate-pulse" />
              Recording...
            </div>
          )}
          {blob && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <video src={URL.createObjectURL(blob)} controls className="w-full rounded-xl border border-border/50" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary">Size: {(blob.size / 1024 / 1024).toFixed(1)} MB</span>
                <a href={URL.createObjectURL(blob)} download="recording.webm"
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-surface text-text border border-border hover:border-primary transition-all">Download</a>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
