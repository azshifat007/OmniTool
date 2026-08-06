'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

export default function NotifyPage() {
  const { addEntry } = useHistory();
  const [title, setTitle] = useState('Hello from OmniTool!');
  const [body, setBody] = useState('This is a test notification.');
  const [status, setStatus] = useState('');
  const [granted, setGranted] = useState(null);

  const checkPermission = useCallback(async () => {
    if (!('Notification' in window)) { setStatus('Notifications not supported in this browser.'); return; }
    const result = Notification.permission;
    setGranted(result === 'granted');
    if (result === 'default') {
      const perm = await Notification.requestPermission();
      setGranted(perm === 'granted');
    }
  }, []);

  const send = useCallback(async () => {
    setStatus('');
    if (!('Notification' in window)) { setStatus('Not supported.'); return; }
    const perm = Notification.permission;
    if (perm === 'default') {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { setStatus('Permission denied.'); return; }
    }
    if (perm === 'denied') { setStatus('Permission was denied. Enable in browser settings.'); return; }
    try {
      new Notification(title.trim() || 'OmniTool', { body: body.trim() || undefined, icon: '/favicon.ico' });
      setStatus('Notification sent!');
      setGranted(true);
      addEntry('Notification Tester');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  }, [title, body, addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-system">ℹ</span>
        <h1 className="font-heading text-2xl font-bold text-text">Notification Tester</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          <p className="text-sm text-text-secondary text-center">Test browser push notifications with custom title and body.</p>
          {granted === null && (
            <button onClick={checkPermission} className="w-full px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Enable Notifications</button>
          )}
          {granted === true && (
            <>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">Body</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
                  className="w-full bg-surface rounded-lg px-3 py-2 text-sm text-text border border-border focus:border-primary focus:outline-none transition-colors resize-none" />
              </div>
              <button onClick={send} className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-dark transition-all cursor-pointer">Send Notification</button>
            </>
          )}
          {granted === false && (
            <div className="text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20 text-center">Notifications blocked. Enable in browser site settings.</div>
          )}
          {status && <div className="text-cat-success text-xs bg-cat-success/10 rounded-lg px-3 py-2 border border-cat-success/20 text-center">{status}</div>}
        </div>
      </GlassCard>
    </motion.div>
  );
}
