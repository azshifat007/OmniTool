'use client';

import MediaConverter from '@/components/MediaConverter';
import { mediaTools } from '@/lib/mediaTools';

export default function VideoConverterPage() {
  return <MediaConverter config={mediaTools['video-converter']} />;
}
