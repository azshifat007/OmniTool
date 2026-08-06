'use client';

import MediaConverter from '@/components/MediaConverter';
import { mediaTools } from '@/lib/mediaTools';

export default function CompressVideoPage() {
  return <MediaConverter config={mediaTools['compress-video']} />;
}
