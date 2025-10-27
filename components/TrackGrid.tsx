'use client';

import Image from 'next/image';
import { Track } from '@/types';

interface TrackGridProps {
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
  columns?: number;
}

export default function TrackGrid({ tracks, onTrackClick, columns = 5 }: TrackGridProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>No tracks found</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {tracks.map((track) => (
        <div
          key={track.id}
          onClick={() => onTrackClick?.(track)}
          className="group bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all cursor-pointer"
        >
          <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
            {track.imageUrl ? (
              <Image
                src={track.imageUrl}
                alt={track.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm mb-1 truncate">{track.name}</h3>
          <p className="text-xs text-gray-400 truncate">{track.artist}</p>
        </div>
      ))}
    </div>
  );
}
