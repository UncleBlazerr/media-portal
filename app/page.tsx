'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Providers } from './providers';
import ListenerSelector from '@/components/ListenerSelector';
import NowPlaying from '@/components/NowPlaying';
import TrackRow from '@/components/TrackRow';
import { ListenerProfile, Track } from '@/types';
import { SpotifyClient } from '@/lib/spotify';

function HomeContent() {
  const { data: session, status } = useSession();
  const [selectedListener, setSelectedListener] = useState<ListenerProfile | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [playlistTrackUris, setPlaylistTrackUris] = useState<Set<string>>(new Set());
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const spotify = new SpotifyClient(session.accessToken!);

      const [top, recent, userPlaylists] = await Promise.all([
        spotify.getTopTracks(5),
        spotify.getRecentlyPlayed(10),
        spotify.getUserPlaylists(),
      ]);

      setTopTracks(top);
      setRecentTracks(recent);
      setPlaylists(userPlaylists);

      // Auto-select "Ryder's Jammies" playlist or first playlist as fallback
      if (userPlaylists.length > 0) {
        const rydersPlaylist = userPlaylists.find(p => p.name === "Ryder's Jammies");
        setSelectedPlaylistId(rydersPlaylist?.id || userPlaylists[0].id);
      }

      setLoading(false);
    };

    fetchData();
  }, [session]);

  // Fetch playlist tracks when playlist changes
  useEffect(() => {
    if (!session?.accessToken || !selectedPlaylistId) {
      setPlaylistTrackUris(new Set());
      setPlaylistTracks([]);
      return;
    }

    const fetchPlaylistTracks = async () => {
      const spotify = new SpotifyClient(session.accessToken!);
      const tracks = await spotify.getPlaylistTracks(selectedPlaylistId);
      const uris = new Set(tracks.map(track => track.uri));
      setPlaylistTrackUris(uris);
      setPlaylistTracks(tracks);
    };

    fetchPlaylistTracks();
  }, [session, selectedPlaylistId]);

  const handleTrackClick = async (track: Track) => {
    if (!session?.accessToken) {
      return;
    }

    try {
      const spotify = new SpotifyClient(session.accessToken);
      await spotify.playTrack(track.uri);
    } catch (error: any) {
      console.error('Error playing track:', error);

      if (error.message === 'NO_ACTIVE_DEVICE') {
        alert('No active Spotify device found!\n\nTo play music:\n1. Open Spotify on your computer or phone\n2. Play any song (then you can pause it)\n3. Try clicking the track again');
      } else if (error.message === 'PREMIUM_REQUIRED') {
        alert('Spotify Premium is required to control playback from this app.');
      } else {
        alert(`Unable to play track: ${error.message}\n\nMake sure Spotify is open and you have an active device.`);
      }
    }
  };

  const handleAddToPlaylist = async (track: Track) => {
    if (!session?.accessToken || !selectedPlaylistId) {
      alert('Please select a playlist first');
      return;
    }

    try {
      // Add track to playlist
      const response = await fetch('/api/spotify/add-to-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: selectedPlaylistId,
          trackUri: track.uri,
        }),
      });

      if (response.ok) {
        // Update the local set to hide the button
        setPlaylistTrackUris(prev => new Set(prev).add(track.uri));

        // Add track to the playlist display
        setPlaylistTracks(prev => [...prev, track]);

        const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
        alert(`Added "${track.name}" to ${selectedPlaylist?.name || 'playlist'}!`);
      } else {
        alert('Failed to add song to playlist');
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Error adding song to playlist');
    }
  };

  const handleAddNowPlayingToPlaylist = async () => {
    if (!session?.accessToken || !selectedListener) return;

    try {
      const spotify = new SpotifyClient(session.accessToken);
      const nowPlaying = await spotify.getCurrentlyPlaying();

      if (!nowPlaying?.track) {
        alert('No song is currently playing');
        return;
      }

      const response = await fetch('/api/spotify/add-to-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: selectedListener.playlistId,
          trackUri: nowPlaying.track.uri,
        }),
      });

      if (response.ok) {
        alert(`Added "${nowPlaying.track.name}" to ${selectedListener.name}'s playlist!`);
      } else {
        alert('Failed to add song to playlist');
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Error adding song to playlist');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">Media Portal</h1>
          <p className="text-xl text-gray-400 mb-8">Your personal music hub</p>
          <button
            onClick={() => signIn('spotify')}
            className="px-8 py-4 bg-green-500 text-white rounded-full font-bold text-lg hover:bg-green-600 transition-all hover:scale-105"
          >
            Connect with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold">Media Portal</h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Playlist Selector Dropdown */}
        <div className="mb-8">
          <label htmlFor="playlist-select" className="block text-lg font-semibold mb-2">
            Select Playlist to Add Songs:
          </label>
          <select
            id="playlist-select"
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-gray-750 transition-colors"
          >
            {playlists.length === 0 ? (
              <option value="">No playlists found</option>
            ) : (
              playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name} ({playlist.trackCount} tracks)
                </option>
              ))
            )}
          </select>
          <p className="mt-2 text-sm text-gray-400">
            Click any song below to add it to the selected playlist
          </p>
        </div>

        {/* Current Playlist Tracks */}
        {selectedPlaylistId && playlistTracks.length > 0 && (
          <div className="mb-8">
            <TrackRow
              title={`${playlists.find(p => p.id === selectedPlaylistId)?.name || 'Playlist'} (${playlistTracks.length} songs)`}
              tracks={playlistTracks}
              onTrackClick={handleTrackClick}
              onAddToPlaylist={handleAddToPlaylist}
              playlistTrackUris={playlistTrackUris}
            />
          </div>
        )}

        <ListenerSelector
          selectedListener={selectedListener}
          onSelect={setSelectedListener}
        />

        <div className="mt-8">
          <NowPlaying
            selectedListener={selectedListener}
            onAddToPlaylist={handleAddNowPlayingToPlaylist}
          />
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl">Loading your music...</div>
            </div>
          ) : (
            <>
              <TrackRow
                key={`top-${selectedPlaylistId}`}
                title="Top 5 Most Played"
                tracks={topTracks}
                onTrackClick={handleTrackClick}
                onAddToPlaylist={handleAddToPlaylist}
                playlistTrackUris={playlistTrackUris}
              />
              <TrackRow
                key={`recent-${selectedPlaylistId}`}
                title="Recently Played"
                tracks={recentTracks}
                onTrackClick={handleTrackClick}
                onAddToPlaylist={handleAddToPlaylist}
                playlistTrackUris={playlistTrackUris}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  );
}
