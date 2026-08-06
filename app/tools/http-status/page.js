'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const statusCodes = [
  { group: '1xx Informational', codes: [
    { code: 100, name: 'Continue', desc: 'Server has received the request headers and client should proceed.' },
    { code: 101, name: 'Switching Protocols', desc: 'Server is switching protocols as requested by the client.' },
    { code: 102, name: 'Processing', desc: 'Server has received and is processing the request, but no response yet.' },
    { code: 103, name: 'Early Hints', desc: 'Server is about to send a final response; used with Link headers for preloading.' },
  ]},
  { group: '2xx Success', codes: [
    { code: 200, name: 'OK', desc: 'Standard success response for HTTP requests.' },
    { code: 201, name: 'Created', desc: 'Request succeeded and a new resource was created.' },
    { code: 202, name: 'Accepted', desc: 'Request accepted for processing but not yet completed.' },
    { code: 203, name: 'Non-Authoritative', desc: 'Response from a third-party source, not the origin server.' },
    { code: 204, name: 'No Content', desc: 'Request succeeded but no content to return.' },
    { code: 205, name: 'Reset Content', desc: 'Tells client to reset the document view.' },
    { code: 206, name: 'Partial Content', desc: 'Partial GET request fulfilled (range request).' },
    { code: 207, name: 'Multi-Status', desc: 'Multiple status codes for multiple operations (WebDAV).' },
    { code: 208, name: 'Already Reported', desc: 'Members of a DAV binding have already been enumerated.' },
    { code: 226, name: 'IM Used', desc: 'Server fulfilled GET with instance manipulations applied.' },
  ]},
  { group: '3xx Redirection', codes: [
    { code: 300, name: 'Multiple Choices', desc: 'Multiple representations for the resource; client picks one.' },
    { code: 301, name: 'Moved Permanently', desc: 'Resource has been permanently moved to a new URL.' },
    { code: 302, name: 'Found', desc: 'Resource temporarily located at a different URL.' },
    { code: 303, name: 'See Other', desc: 'Response can be found at another URI using GET.' },
    { code: 304, name: 'Not Modified', desc: 'Resource not modified since last request (caching).' },
    { code: 305, name: 'Use Proxy', desc: 'Requested resource must be accessed through a proxy.' },
    { code: 307, name: 'Temporary Redirect', desc: 'Resource temporarily moved; repeat request with same method.' },
    { code: 308, name: 'Permanent Redirect', desc: 'Resource moved permanently; repeat request with same method.' },
  ]},
  { group: '4xx Client Errors', codes: [
    { code: 400, name: 'Bad Request', desc: 'Server cannot process request due to client error.' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or not provided.' },
    { code: 402, name: 'Payment Required', desc: 'Reserved for future use; originally for digital payments.' },
    { code: 403, name: 'Forbidden', desc: 'Server understood the request but refuses to authorize it.' },
    { code: 404, name: 'Not Found', desc: 'Requested resource could not be found on the server.' },
    { code: 405, name: 'Method Not Allowed', desc: 'HTTP method not supported for the requested resource.' },
    { code: 406, name: 'Not Acceptable', desc: 'Server cannot produce a response matching client Accept headers.' },
    { code: 407, name: 'Proxy Auth Required', desc: 'Client must authenticate with a proxy first.' },
    { code: 408, name: 'Request Timeout', desc: 'Server timed out waiting for the client request.' },
    { code: 409, name: 'Conflict', desc: 'Request conflicts with current state of the resource.' },
    { code: 410, name: 'Gone', desc: 'Resource is no longer available and no forwarding address.' },
    { code: 411, name: 'Length Required', desc: 'Content-Length header is required but was not provided.' },
    { code: 412, name: 'Precondition Failed', desc: 'One or more preconditions evaluated to false.' },
    { code: 413, name: 'Payload Too Large', desc: 'Request payload is larger than server is willing to process.' },
    { code: 414, name: 'URI Too Long', desc: 'Request URI is longer than the server can interpret.' },
    { code: 415, name: 'Unsupported Media Type', desc: 'Request media format is not supported by the server.' },
    { code: 416, name: 'Range Not Satisfiable', desc: 'Requested range cannot be satisfied by the server.' },
    { code: 417, name: 'Expectation Failed', desc: 'Expect header could not be met by the server.' },
    { code: 418, name: "I'm a Teapot", desc: 'April Fools joke response; server refuses to brew coffee in a teapot.' },
    { code: 421, name: 'Misdirected Request', desc: 'Request sent to a server that cannot produce a response.' },
    { code: 422, name: 'Unprocessable Entity', desc: 'Request well-formed but unable to process instructions (WebDAV).' },
    { code: 423, name: 'Locked', desc: 'Resource is locked (WebDAV).' },
    { code: 424, name: 'Failed Dependency', desc: 'Request failed due to failure of a previous request (WebDAV).' },
    { code: 425, name: 'Too Early', desc: 'Server refuses to replay a request that might be replayed.' },
    { code: 426, name: 'Upgrade Required', desc: 'Client should upgrade to a different protocol.' },
    { code: 428, name: 'Precondition Required', desc: 'Origin server requires the request to be conditional.' },
    { code: 429, name: 'Too Many Requests', desc: 'Client has sent too many requests in a given time (rate limiting).' },
    { code: 431, name: 'Headers Too Large', desc: 'Request header fields are too large for the server.' },
    { code: 451, name: 'Unavailable For Legal', desc: 'Resource unavailable for legal reasons (censorship).' },
  ]},
  { group: '5xx Server Errors', codes: [
    { code: 500, name: 'Internal Server Error', desc: 'Generic server error when no specific message is suitable.' },
    { code: 501, name: 'Not Implemented', desc: 'Server does not support the functionality to fulfill request.' },
    { code: 502, name: 'Bad Gateway', desc: 'Invalid response received from an upstream server.' },
    { code: 503, name: 'Service Unavailable', desc: 'Server temporarily unable to handle the request (overloaded/down).' },
    { code: 504, name: 'Gateway Timeout', desc: 'Upstream server failed to respond in time.' },
    { code: 505, name: 'HTTP Version Not Supported', desc: 'HTTP protocol version used is not supported by the server.' },
    { code: 506, name: 'Variant Also Negotiates', desc: 'Transparent content negotiation resulted in a circular reference.' },
    { code: 507, name: 'Insufficient Storage', desc: 'Server is unable to store the representation (WebDAV).' },
    { code: 508, name: 'Loop Detected', desc: 'Server detected an infinite loop while processing (WebDAV).' },
    { code: 510, name: 'Not Extended', desc: 'Further extensions to the request are required.' },
    { code: 511, name: 'Network Auth Required', desc: 'Client needs to authenticate to gain network access.' },
  ]},
];

const groupColors = {
  '1xx Informational': 'text-cat-code',
  '2xx Success': 'text-cat-success',
  '3xx Redirection': 'text-cat-date',
  '4xx Client Errors': 'text-cat-media',
  '5xx Server Errors': 'text-cat-text',
};

export default function HttpStatusPage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');

  const filtered = statusCodes.map(group => ({
    ...group,
    codes: group.codes.filter(c =>
      !search.trim() ||
      c.code.toString().includes(search.trim()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.codes.length > 0);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    addEntry('HTTP Status Codes');
  }, [addEntry]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-code">[?]</span>
        <h1 className="font-heading text-2xl font-bold text-text">HTTP Status Codes</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Search codes or names</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. 404, Not Found, timeout..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      <div className="mt-5 space-y-5">
        {filtered.map(group => (
          <GlassCard key={group.group}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm font-bold ${groupColors[group.group] || 'text-text'}`}>{group.group}</span>
                <span className="text-xs text-text-tertiary">({group.codes.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-text-tertiary border-b border-border">
                      <th className="text-left py-2 pr-3 font-medium w-16">Code</th>
                      <th className="text-left py-2 pr-3 font-medium w-40">Name</th>
                      <th className="text-left py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.codes.map(({ code, name, desc }) => (
                      <tr key={code} onClick={() => handleCopy(`${code} ${name}`)}
                        className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-surface/50 transition-colors">
                        <td className="py-2 pr-3 text-text font-mono font-bold align-top">{code}</td>
                        <td className="py-2 pr-3 text-text-secondary font-mono align-top">{name}</td>
                        <td className="py-2 text-text-tertiary text-xs align-top">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
