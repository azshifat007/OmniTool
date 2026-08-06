'use client';

import MediaConverter from '@/components/MediaConverter';
import { mediaTools } from '@/lib/mediaTools';

export default function AudioConverterPage() {
  return <MediaConverter config={mediaTools['audio-converter']} />;
}
