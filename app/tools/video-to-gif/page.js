'use client';

import MediaConverter from '@/components/MediaConverter';
import { mediaTools } from '@/lib/mediaTools';

export default function VideoToGifPage() {
  return <MediaConverter config={mediaTools['video-to-gif']} />;
}
