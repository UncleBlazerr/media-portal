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

export interface MusicProfile {
  id: string;
  name: string;
  keywords: string[]; // Array of keywords for playlist matching (case-insensitive)
  color: string;
  icon?: string; // Optional emoji or icon
  createdAt?: Date;
  updatedAt?: Date;
}
