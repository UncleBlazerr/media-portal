export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  duration: number;
  uri: string;
  previewUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  imageUrl?: string;
  trackCount: number;
  uri: string;
}

export interface ListenerProfile {
  id: string;
  name: string;
  avatar?: string;
  playlistId: string; // The Spotify playlist to add songs to
  color: string;
}

export interface CurrentlyPlaying {
  track: Track;
  isPlaying: boolean;
  progressMs: number;
  timestamp: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'spotify' | 'youtube';
  url: string;
  thumbnail?: string;
  isFeatured?: boolean;
}

export interface UIState {
  selectedListener: ListenerProfile | null;
  currentView: 'home' | 'playlists' | 'search';
  isLoading: boolean;
}
