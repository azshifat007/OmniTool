export const mediaTools = {
  'video-converter': {
    title: 'Video Converter',
    icon: '🎞',
    tagline: 'Convert video between MP4, WebM, MOV, MKV, AVI and GIF — right in your browser.',
    accept: 'video/*,.mkv,.avi,.mov,.m4v',
    defaultFormat: 'mp4',
    formats: [
      { ext: 'mp4', label: 'MP4', args: (o) => ['-c:v', 'libx264', '-preset', o.preset, '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'] },
      { ext: 'webm', label: 'WebM', args: () => ['-c:v', 'libvpx', '-crf', '10', '-b:v', '1M', '-c:a', 'libvorbis', '-q:a', '5'] },
      { ext: 'mov', label: 'MOV', args: (o) => ['-c:v', 'libx264', '-preset', o.preset, '-crf', '23', '-c:a', 'aac', '-b:a', '128k'] },
      { ext: 'mkv', label: 'MKV', args: (o) => ['-c:v', 'libx264', '-preset', o.preset, '-crf', '23', '-c:a', 'aac', '-b:a', '128k'] },
      { ext: 'avi', label: 'AVI', args: (o) => ['-c:v', 'libx264', '-preset', o.preset, '-crf', '23', '-c:a', 'libmp3lame', '-b:a', '128k'] },
      { ext: 'gif', label: 'GIF', args: () => ['-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0'] },
    ],
    options: [
      { key: 'preset', label: 'Quality', type: 'select', default: 'medium', choices: [
        { v: 'fast', l: 'Fast · smaller file' },
        { v: 'medium', l: 'Balanced' },
        { v: 'slow', l: 'Best quality · larger file' },
      ] },
    ],
  },

  'audio-converter': {
    title: 'Audio Converter',
    icon: '🎵',
    tagline: 'Convert audio between MP3, WAV, OGG, FLAC, AAC, M4A, Opus and WebM.',
    accept: 'audio/*,.flac,.aac,.m4a,.opus',
    defaultFormat: 'mp3',
    formats: [
      { ext: 'mp3', label: 'MP3', args: (o) => ['-vn', '-c:a', 'libmp3lame', '-b:a', o.bitrate] },
      { ext: 'wav', label: 'WAV', args: () => ['-vn', '-c:a', 'pcm_s16le'] },
      { ext: 'ogg', label: 'OGG', args: () => ['-vn', '-c:a', 'libvorbis', '-q:a', '5'] },
      { ext: 'flac', label: 'FLAC', args: () => ['-vn', '-c:a', 'flac'] },
      { ext: 'm4a', label: 'M4A', args: (o) => ['-vn', '-c:a', 'aac', '-b:a', o.bitrate] },
      { ext: 'opus', label: 'Opus', args: (o) => ['-vn', '-c:a', 'libopus', '-b:a', o.bitrate] },
      { ext: 'webm', label: 'WebM', args: (o) => ['-vn', '-c:a', 'libopus', '-b:a', o.bitrate] },
    ],
    options: [
      { key: 'bitrate', label: 'Bitrate (lossy formats)', type: 'select', default: '192k', choices: [
        { v: '128k', l: '128 kbps · smaller' },
        { v: '192k', l: '192 kbps' },
        { v: '256k', l: '256 kbps' },
        { v: '320k', l: '320 kbps · best' },
      ] },
    ],
  },

  'extract-audio': {
    title: 'Extract Audio',
    icon: '🔊',
    tagline: 'Pull the audio track out of any video as MP3, WAV, M4A, OGG, FLAC or Opus.',
    accept: 'video/*,.mkv,.avi,.mov,.m4v',
    defaultFormat: 'mp3',
    formats: [
      { ext: 'mp3', label: 'MP3', args: (o) => ['-vn', '-c:a', 'libmp3lame', '-b:a', o.bitrate] },
      { ext: 'wav', label: 'WAV', args: () => ['-vn', '-c:a', 'pcm_s16le'] },
      { ext: 'm4a', label: 'M4A', args: (o) => ['-vn', '-c:a', 'aac', '-b:a', o.bitrate] },
      { ext: 'ogg', label: 'OGG', args: () => ['-vn', '-c:a', 'libvorbis', '-q:a', '5'] },
      { ext: 'flac', label: 'FLAC', args: () => ['-vn', '-c:a', 'flac'] },
      { ext: 'opus', label: 'Opus', args: (o) => ['-vn', '-c:a', 'libopus', '-b:a', o.bitrate] },
    ],
    options: [
      { key: 'bitrate', label: 'Bitrate (lossy formats)', type: 'select', default: '192k', choices: [
        { v: '128k', l: '128 kbps · smaller' },
        { v: '192k', l: '192 kbps' },
        { v: '256k', l: '256 kbps' },
        { v: '320k', l: '320 kbps · best' },
      ] },
    ],
  },

  'video-to-gif': {
    title: 'Video to GIF',
    icon: '🖼',
    tagline: 'Turn any video clip into an animated GIF with smart palette colors.',
    accept: 'video/*,.mkv,.avi,.mov,.m4v',
    defaultFormat: 'gif',
    formats: [
      { ext: 'gif', label: 'GIF', args: (o) => {
        const w = o.width === '0' ? '' : `${o.width}:`;
        return ['-vf', `fps=${o.fps},scale=${w}-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`, '-loop', '0'];
      } },
    ],
    options: [
      { key: 'fps', label: 'Frame rate', type: 'select', default: '10', choices: [
        { v: '8', l: '8 fps' }, { v: '10', l: '10 fps' }, { v: '12', l: '12 fps' },
        { v: '15', l: '15 fps' }, { v: '20', l: '20 fps' },
      ] },
      { key: 'width', label: 'Max width', type: 'select', default: '480', choices: [
        { v: '0', l: 'Original' }, { v: '320', l: '320 px' }, { v: '480', l: '480 px' },
        { v: '640', l: '640 px' }, { v: '720', l: '720 px' },
      ] },
    ],
  },

  'compress-video': {
    title: 'Compress Video',
    icon: '🗜',
    tagline: 'Shrink video file size with H.264 quality control and optional resolution cap.',
    accept: 'video/*,.mkv,.avi,.mov,.m4v',
    defaultFormat: 'mp4',
    formats: [
      { ext: 'mp4', label: 'Compressed MP4', args: (o) => {
        const vf = o.width === '0' ? [] : ['-vf', `scale='min(${o.width},iw)':-2`];
        return ['-c:v', 'libx264', '-preset', 'medium', '-crf', o.crf, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', ...vf];
      } },
    ],
    options: [
      { key: 'crf', label: 'Quality (lower = better, larger)', type: 'range', min: 18, max: 40, default: 28, unit: '' },
      { key: 'width', label: 'Max width', type: 'select', default: '0', choices: [
        { v: '0', l: 'Original' }, { v: '480', l: '480 px' }, { v: '720', l: '720 px' }, { v: '1080', l: '1080 px' },
      ] },
    ],
  },
};
