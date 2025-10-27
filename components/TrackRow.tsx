'use client';

import Image from 'next/image';
import { Track } from '@/types';

interface TrackRowProps {
  title: string;
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  playlistTrackUris?: Set<string>;
}

export default function TrackRow({ title, tracks, onTrackClick, onAddToPlaylist, playlistTrackUris }: TrackRowProps) {
  if (tracks.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex-shrink-0 w-48 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all group"
          >
            <div
              onClick={() => onTrackClick?.(track)}
              className="cursor-pointer"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
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
                {title.includes('Top') && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white font-bold w-8 h-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1 truncate">{track.name}</h3>
              <p className="text-xs text-gray-400 truncate">{track.artist}</p>
            </div>

            {/* Heart Icon Button - Only show if track not in playlist */}
            {!playlistTrackUris?.has(track.uri) && onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPlaylist(track);
                }}
                className="mt-2 w-full py-2 flex items-center justify-center gap-2 bg-gray-800 hover:bg-green-600 rounded-md transition-colors group/btn"
                title="Add to playlist"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover/btn:text-white transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-400 group-hover/btn:text-white transition-colors">Add</span>
              </button>
            )}
            {playlistTrackUris?.has(track.uri) && (
              <div className="mt-2 w-full py-2 flex items-center justify-center gap-2 bg-gray-700 rounded-md text-gray-500 cursor-not-allowed">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">In Playlist</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
