'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

export default function URLParserPage() {
  const { addEntry } = useHistory();
  const [url, setUrl] = useState('https://example.com/path/to/page?name=value&key=123#section');

  const onChange = (e) => { setUrl(e.target.value); addEntry('URL Parser'); };

  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      return {
        valid: true,
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port || '(default)',
        pathname: u.pathname,
        search: u.search || '(none)',
        hash: u.hash || '(none)',
        origin: u.origin,
        username: u.username || '(none)',
        password: u.password || '(none)',
        params: [...u.searchParams.entries()],
      };
    } catch {
      return { valid: false, params: [] };
    }
  }, [url]);

  const rows = parsed.valid ? [
    ['Protocol', parsed.protocol],
    ['Host', parsed.host],
    ['Hostname', parsed.hostname],
    ['Port', parsed.port],
    ['Pathname', parsed.pathname],
    ['Search', parsed.search],
    ['Hash', parsed.hash],
    ['Origin', parsed.origin],
    ['Username', parsed.username],
    ['Password', parsed.password],
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">⇉</span>
        <h1 className="font-heading text-2xl font-bold text-text">URL Parser</h1>
      </div>
      <GlassCard>
        <div className="p-4 space-y-4">
          <input type="url" value={url} onChange={onChange}
            placeholder="Enter a URL..."
            className="w-full bg-surface text-text rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-text-tertiary font-mono" />
          {parsed.valid ? (
            <>
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex border-b border-border/50 last:border-0">
                    <div className="w-28 shrink-0 px-3 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wide bg-badge-bg/50">{label}</div>
                    <div className="flex-1 px-3 py-2 text-sm text-text font-mono break-all">{value}</div>
                  </div>
                ))}
              </div>
              {parsed.params.length > 0 && (
                <>
                  <div className="text-xs text-text-tertiary font-semibold uppercase tracking-wide">Query Parameters ({parsed.params.length})</div>
                  <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-2 text-text-tertiary font-medium text-xs uppercase tracking-wide">Key</th>
                          <th className="text-left px-3 py-2 text-text-tertiary font-medium text-xs uppercase tracking-wide">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.params.map(([k, v]) => (
                          <tr key={k} className="border-b border-border/50 last:border-0">
                            <td className="px-3 py-2 text-text font-mono">{k}</td>
                            <td className="px-3 py-2 text-text font-mono break-all">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <CopyButton text={[
                  ...rows.map(([label, value]) => `${label}: ${value}`),
                  '',
                  'Query Parameters:',
                  ...parsed.params.map(([k, v]) => `  ${k} = ${v}`),
                ].join('\n')} />
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-sm text-cat-text">Invalid URL — check the format</div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
