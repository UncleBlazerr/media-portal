'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { CurrentlyPlaying, ListenerProfile } from '@/types';
import { SpotifyClient } from '@/lib/spotify';

interface NowPlayingProps {
  selectedListener: ListenerProfile | null;
  onAddToPlaylist?: () => void;
}

export default function NowPlaying({ selectedListener, onAddToPlaylist }: NowPlayingProps) {
  const { data: session } = useSession();
  const [nowPlaying, setNowPlaying] = useState<CurrentlyPlaying | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchNowPlaying = async () => {
      const spotify = new SpotifyClient(session.accessToken!);
      const data = await spotify.getCurrentlyPlaying();
      setNowPlaying(data);
      setLoading(false);
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [session]);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-lg">
        <div className="flex gap-6 animate-pulse">
          <div className="w-48 h-48 bg-gray-700 rounded-lg" />
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="h-8 bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!nowPlaying || !nowPlaying.track) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-lg text-center">
        <p className="text-gray-400">No song currently playing</p>
      </div>
    );
  }

  const progress = (nowPlaying.progressMs / nowPlaying.track.duration) * 100;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-lg">
      <div className="flex gap-6">
        <div className="relative w-48 h-48 flex-shrink-0">
          {nowPlaying.track.imageUrl && (
            <Image
              src={nowPlaying.track.imageUrl}
              alt={nowPlaying.track.name}
              fill
              className="rounded-lg object-cover"
            />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">{nowPlaying.track.name}</h2>
            <p className="text-xl text-gray-400">{nowPlaying.track.artist}</p>
            <p className="text-sm text-gray-500">{nowPlaying.track.album}</p>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{formatTime(nowPlaying.progressMs)}</span>
              <span>{formatTime(nowPlaying.track.duration)}</span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {selectedListener && onAddToPlaylist && (
            <button
              onClick={onAddToPlaylist}
              className="px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: selectedListener.color }}
            >
              Add to {selectedListener.name}'s Playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
