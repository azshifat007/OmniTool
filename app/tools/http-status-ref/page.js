'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { useHistory } from '@/components/HistoryProvider';

const statusCodes = [
  { code: 100, name: 'Continue', desc: 'Server has received the request headers and the client should proceed.', spec: 'RFC 9110' },
  { code: 101, name: 'Switching Protocols', desc: 'Server is switching protocols as requested by the client via Upgrade header.', spec: 'RFC 9110' },
  { code: 102, name: 'Processing', desc: 'Server has received and is processing the request, but no response is available yet.', spec: 'RFC 2518' },
  { code: 103, name: 'Early Hints', desc: 'Server is about to send a final response; used with Link header for preloading.', spec: 'RFC 8297' },
  { code: 200, name: 'OK', desc: 'Standard success response for HTTP requests.', spec: 'RFC 9110' },
  { code: 201, name: 'Created', desc: 'Request succeeded and a new resource was created.', spec: 'RFC 9110' },
  { code: 202, name: 'Accepted', desc: 'Request accepted for processing but not yet completed.', spec: 'RFC 9110' },
  { code: 203, name: 'Non-Authoritative Information', desc: 'Response from a third-party source, not the origin server.', spec: 'RFC 9110' },
  { code: 204, name: 'No Content', desc: 'Request succeeded but there is no content to return.', spec: 'RFC 9110' },
  { code: 205, name: 'Reset Content', desc: 'Tells the client to reset the document view.', spec: 'RFC 9110' },
  { code: 206, name: 'Partial Content', desc: 'Partial GET request fulfilled (range request).', spec: 'RFC 9110' },
  { code: 207, name: 'Multi-Status', desc: 'Multiple status codes for multiple operations (WebDAV).', spec: 'RFC 4918' },
  { code: 208, name: 'Already Reported', desc: 'Members of a DAV binding have already been enumerated.', spec: 'RFC 5842' },
  { code: 226, name: 'IM Used', desc: 'Server fulfilled GET with instance manipulations applied.', spec: 'RFC 3229' },
  { code: 300, name: 'Multiple Choices', desc: 'Multiple representations for the resource; client picks one.', spec: 'RFC 9110' },
  { code: 301, name: 'Moved Permanently', desc: 'Resource has been permanently moved to a new URL.', spec: 'RFC 9110' },
  { code: 302, name: 'Found', desc: 'Resource temporarily located at a different URL.', spec: 'RFC 9110' },
  { code: 303, name: 'See Other', desc: 'Response can be found at another URI using GET.', spec: 'RFC 9110' },
  { code: 304, name: 'Not Modified', desc: 'Resource not modified since last request (caching).', spec: 'RFC 9110' },
  { code: 305, name: 'Use Proxy', desc: 'Requested resource must be accessed through a proxy.', spec: 'RFC 9110' },
  { code: 307, name: 'Temporary Redirect', desc: 'Resource temporarily moved; repeat request with same method.', spec: 'RFC 9110' },
  { code: 308, name: 'Permanent Redirect', desc: 'Resource moved permanently; repeat request with same method.', spec: 'RFC 9110' },
  { code: 400, name: 'Bad Request', desc: 'Server cannot process request due to client error.', spec: 'RFC 9110' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or not provided.', spec: 'RFC 9110' },
  { code: 402, name: 'Payment Required', desc: 'Reserved for future use; originally for digital payments.', spec: 'RFC 9110' },
  { code: 403, name: 'Forbidden', desc: 'Server understood the request but refuses to authorize it.', spec: 'RFC 9110' },
  { code: 404, name: 'Not Found', desc: 'Requested resource could not be found on the server.', spec: 'RFC 9110' },
  { code: 405, name: 'Method Not Allowed', desc: 'HTTP method not supported for the requested resource.', spec: 'RFC 9110' },
  { code: 406, name: 'Not Acceptable', desc: 'Server cannot produce a response matching client Accept headers.', spec: 'RFC 9110' },
  { code: 407, name: 'Proxy Authentication Required', desc: 'Client must authenticate with a proxy first.', spec: 'RFC 9110' },
  { code: 408, name: 'Request Timeout', desc: 'Server timed out waiting for the client request.', spec: 'RFC 9110' },
  { code: 409, name: 'Conflict', desc: 'Request conflicts with current state of the resource.', spec: 'RFC 9110' },
  { code: 410, name: 'Gone', desc: 'Resource is no longer available and no forwarding address.', spec: 'RFC 9110' },
  { code: 411, name: 'Length Required', desc: 'Content-Length header is required but was not provided.', spec: 'RFC 9110' },
  { code: 412, name: 'Precondition Failed', desc: 'One or more preconditions evaluated to false.', spec: 'RFC 9110' },
  { code: 413, name: 'Content Too Large', desc: 'Request payload is larger than server is willing to process.', spec: 'RFC 9110' },
  { code: 414, name: 'URI Too Long', desc: 'Request URI is longer than the server can interpret.', spec: 'RFC 9110' },
  { code: 415, name: 'Unsupported Media Type', desc: 'Request media format is not supported by the server.', spec: 'RFC 9110' },
  { code: 416, name: 'Range Not Satisfiable', desc: 'Requested range cannot be satisfied by the server.', spec: 'RFC 9110' },
  { code: 417, name: 'Expectation Failed', desc: 'Expect header could not be met by the server.', spec: 'RFC 9110' },
  { code: 418, name: "I'm a Teapot", desc: 'April Fools joke response; server refuses to brew coffee in a teapot.', spec: 'RFC 2324' },
  { code: 421, name: 'Misdirected Request', desc: 'Request sent to a server that cannot produce a response.', spec: 'RFC 9110' },
  { code: 422, name: 'Unprocessable Content', desc: 'Request well-formed but semantically incorrect.', spec: 'RFC 9110' },
  { code: 423, name: 'Locked', desc: 'Resource is locked (WebDAV).', spec: 'RFC 4918' },
  { code: 424, name: 'Failed Dependency', desc: 'Request failed due to failure of a previous request (WebDAV).', spec: 'RFC 4918' },
  { code: 425, name: 'Too Early', desc: 'Server refuses to replay a request that might be replayed.', spec: 'RFC 8470' },
  { code: 426, name: 'Upgrade Required', desc: 'Client should upgrade to a different protocol.', spec: 'RFC 9110' },
  { code: 428, name: 'Precondition Required', desc: 'Origin server requires the request to be conditional.', spec: 'RFC 6585' },
  { code: 429, name: 'Too Many Requests', desc: 'Client has sent too many requests in a given time (rate limiting).', spec: 'RFC 6585' },
  { code: 431, name: 'Request Header Fields Too Large', desc: 'Request header fields are too large for the server.', spec: 'RFC 6585' },
  { code: 451, name: 'Unavailable For Legal Reasons', desc: 'Resource unavailable for legal reasons (censorship).', spec: 'RFC 7725' },
  { code: 500, name: 'Internal Server Error', desc: 'Generic server error when no specific message is suitable.', spec: 'RFC 9110' },
  { code: 501, name: 'Not Implemented', desc: 'Server does not support the functionality to fulfill request.', spec: 'RFC 9110' },
  { code: 502, name: 'Bad Gateway', desc: 'Invalid response received from an upstream server.', spec: 'RFC 9110' },
  { code: 503, name: 'Service Unavailable', desc: 'Server temporarily unable to handle the request (overloaded/down).', spec: 'RFC 9110' },
  { code: 504, name: 'Gateway Timeout', desc: 'Upstream server failed to respond in time.', spec: 'RFC 9110' },
  { code: 505, name: 'HTTP Version Not Supported', desc: 'HTTP protocol version used is not supported by the server.', spec: 'RFC 9110' },
  { code: 506, name: 'Variant Also Negotiates', desc: 'Transparent content negotiation resulted in a circular reference.', spec: 'RFC 2295' },
  { code: 507, name: 'Insufficient Storage', desc: 'Server is unable to store the representation (WebDAV).', spec: 'RFC 4918' },
  { code: 508, name: 'Loop Detected', desc: 'Server detected an infinite loop while processing (WebDAV).', spec: 'RFC 5842' },
  { code: 510, name: 'Not Extended', desc: 'Further extensions to the request are required.', spec: 'RFC 2774' },
  { code: 511, name: 'Network Authentication Required', desc: 'Client needs to authenticate to gain network access.', spec: 'RFC 6585' },
];

const groupColors = {
  1: { label: '1xx Informational', class: 'text-cat-code' },
  2: { label: '2xx Success', class: 'text-cat-success' },
  3: { label: '3xx Redirection', class: 'text-cat-date' },
  4: { label: '4xx Client Error', class: 'text-cat-media' },
  5: { label: '5xx Server Error', class: 'text-cat-text' },
};

export default function HttpStatusRefPage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return statusCodes;
    const q = search.toLowerCase();
    return statusCodes.filter(c =>
      c.code.toString().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(c => {
      const grp = groupColors[Math.floor(c.code / 100)] || { label: 'Other', class: 'text-text-tertiary' };
      if (!g[grp.label]) g[grp.label] = { codes: [], class: grp.class };
      g[grp.label].codes.push(c);
    });
    return Object.entries(g);
  }, [filtered]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">200</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTTP Status Reference</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Search by code, name, or description</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. 404, Not Found, timeout..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="mt-4">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold font-heading ${groupColors[Math.floor(selected.code / 100)]?.class || 'text-text'}`}>
                    {selected.code}
                  </span>
                  <span className="text-sm font-medium text-text">{selected.name}</span>
                </div>
                <button onClick={() => setSelected(null)}
                  className="px-2 py-1 text-xs bg-surface rounded-lg border border-border text-text-tertiary hover:text-text transition-all cursor-pointer">Close</button>
              </div>
              <p className="text-xs text-text-tertiary mt-2">{selected.desc}</p>
              <span className="text-xs text-text-tertiary mt-1 block font-mono">{selected.spec}</span>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="mt-5 space-y-5">
        {grouped.map(([group, { codes, class: cls }]) => (
          <GlassCard key={group}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm font-bold ${cls}`}>{group}</span>
                <span className="text-xs text-text-tertiary">({codes.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {codes.map(c => (
                  <button key={c.code} onClick={() => { setSelected(c); addEntry('HTTP Status Reference'); }}
                    className={`px-3 py-2 text-xs font-mono rounded-lg border cursor-pointer transition-all ${
                      selected?.code === c.code
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text border-border/50 hover:border-primary/40'
                    }`}>
                    <span className={`font-bold ${selected?.code === c.code ? 'text-white' : cls}`}>{c.code}</span>
                    <span className="ml-1.5 text-text-tertiary">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">No matching status codes found.</div>
      )}
    </motion.div>
  );
}
