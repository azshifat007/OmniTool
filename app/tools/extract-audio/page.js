'use client';

import MediaConverter from '@/components/MediaConverter';
import { mediaTools } from '@/lib/mediaTools';

export default function ExtractAudioPage() {
  return <MediaConverter config={mediaTools['extract-audio']} />;
}
