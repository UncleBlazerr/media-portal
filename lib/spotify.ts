import axios from 'axios';
import { Track, Playlist, CurrentlyPlaying } from '@/types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return response.json();
  }

  async getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
    try {
      const data = await this.fetch('/me/player/currently-playing');

      if (!data || !data.item) return null;

      return {
        track: this.formatTrack(data.item),
        isPlaying: data.is_playing,
        progressMs: data.progress_ms,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Error fetching currently playing:', error);
      return null;
    }
  }

  async getRecentlyPlayed(limit: number = 10): Promise<Track[]> {
    try {
      const data = await this.fetch(`/me/player/recently-played?limit=${limit}`);
      return data.items.map((item: any) => this.formatTrack(item.track));
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return [];
    }
  }

  async getTopTracks(limit: number = 5, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term'): Promise<Track[]> {
    try {
      const data = await this.fetch(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`);
      return data.items.map((item: any) => this.formatTrack(item));
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return [];
    }
  }

  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      const data = await this.fetch('/me/playlists?limit=50');

      if (!data || !data.items) {
        console.error('No items in playlists response');
        return [];
      }

      const playlists = data.items.map((item: any) => this.formatPlaylist(item));
      return playlists;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    try {
      const allTracks: Track[] = [];
      let url = `/playlists/${playlistId}/tracks?limit=100`;

      // Fetch all pages of playlist tracks
      while (url) {
        const data = await this.fetch(url);
        const tracks = data.items.map((item: any) => this.formatTrack(item.track));
        allTracks.push(...tracks);

        // Get next page URL if it exists
        url = data.next ? data.next.replace(SPOTIFY_API_BASE, '') : null;
      }

      return allTracks;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      return [];
    }
  }

  async isTrackInPlaylist(playlistId: string, trackUri: string): Promise<boolean> {
    try {
      const tracks = await this.getPlaylistTracks(playlistId);
      return tracks.some(track => track.uri === trackUri);
    } catch (error) {
      console.error('Error checking if track is in playlist:', error);
      return false;
    }
  }

  async addTrackToPlaylist(playlistId: string, trackUri: string): Promise<boolean> {
    try {
      await this.fetch(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });
      return true;
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      return false;
    }
  }

  async playTrack(trackUri: string): Promise<boolean> {
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (response.status === 404) {
        throw new Error('NO_ACTIVE_DEVICE');
      }

      if (response.status === 403) {
        throw new Error('PREMIUM_REQUIRED');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
        console.error('Spotify play error:', errorData);
        throw new Error(errorData.error?.message || 'Unknown error');
      }

      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    try {
      const data = await this.fetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
      return data.tracks.items.map((item: any) => this.formatTrack(item));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  private formatTrack(item: any): Track {
    return {
      id: item.id,
      name: item.name,
      artist: item.artists.map((a: any) => a.name).join(', '),
      album: item.album.name,
      imageUrl: item.album.images[0]?.url || '',
      duration: item.duration_ms,
      uri: item.uri,
      previewUrl: item.preview_url,
    };
  }

  private formatPlaylist(item: any): Playlist {
    return {
      id: item.id,
      name: item.name,
      imageUrl: item.images?.[0]?.url,
      trackCount: item.tracks.total,
      uri: item.uri,
    };
  }
}
