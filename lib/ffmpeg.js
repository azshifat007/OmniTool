'use client';

let ffmpeg = null;
let loadPromise = null;

async function loadFFmpeg() {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const instance = new FFmpeg();
  await instance.load({
    coreURL: '/ffmpeg/ffmpeg-core.js',
    wasmURL: '/ffmpeg/ffmpeg-core.wasm',
  });
  return instance;
}

export async function getFFmpeg() {
  if (!loadPromise) {
    loadPromise = loadFFmpeg().catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

export function resetFFmpeg() {
  if (loadPromise) {
    loadPromise.then((instance) => {
      try { instance.terminate(); } catch (e) { /* already terminated */ }
    }).catch(() => {});
    loadPromise = null;
    ffmpeg = null;
  }
}

const MAX_INPUT_BYTES = 300 * 1024 * 1024;

export async function convertMedia({ file, args, outName, onProgress }) {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('File is larger than 300MB. Large files may exhaust browser memory — try a smaller clip or a lower resolution.');
  }
  const instance = await getFFmpeg();
  const inputName = file.name || 'input';
  const safeIn = inputName.replace(/[^a-zA-Z0-9._-]/g, '_');

  let last = 0;
  instance.on('progress', ({ progress }) => {
    const pct = Math.min(99, Math.round(progress * 100));
    if (pct !== last) {
      last = pct;
      if (onProgress) onProgress(pct);
    }
  });
  const logLines = [];
  instance.on('log', ({ message }) => {
    logLines.push(message);
    if (message.includes('Error') || message.includes('failed')) {
      console.error('[ffmpeg]', message);
    }
  });

  await instance.writeFile(safeIn, new Uint8Array(await file.arrayBuffer()));
  if (onProgress) onProgress(0);

  try {
    const ret = await instance.exec(args.map((a) => String(a).replace('{input}', safeIn)));
    if (ret !== 0) {
      const tail = logLines.slice(-12).join(' | ');
      throw new Error(`ffmpeg exited with code ${ret}${tail ? ` — ${tail}` : ''}`);
    }
  } catch (e) {
    const tail = logLines.slice(-12).join(' | ');
    const detail = (e && e.message) || String(e);
    throw new Error(`ffmpeg error: ${detail}${tail ? ` — ${tail}` : ''}`);
  } finally {
    instance.off('progress');
    instance.off('log');
  }

  const outData = await instance.readFile(outName);
  const out = new Blob([outData.buffer], { type: getMime(outName) });
  await instance.deleteFile(safeIn).catch(() => {});
  await instance.deleteFile(outName).catch(() => {});
  if (onProgress) onProgress(100);
  return { blob: out, fileName: outName };
}

function getMime(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    mkv: 'video/x-matroska', avi: 'video/x-msvideo', gif: 'image/gif',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    flac: 'audio/flac', m4a: 'audio/mp4', opus: 'audio/opus',
  };
  return map[ext] || 'application/octet-stream';
}
