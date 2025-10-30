import { MusicProfile } from '@/types';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  trackCount: number;
  images?: { url: string }[];
  description?: string;
}

/**
 * Filter playlists based on a music profile's keywords
 * Uses case-insensitive partial matching
 * A playlist matches if ANY keyword is found in the playlist name
 */
export function filterPlaylistsByProfile(
  playlists: SpotifyPlaylist[],
  profile: MusicProfile
): SpotifyPlaylist[] {
  if (!profile.keywords || profile.keywords.length === 0) {
    return [];
  }

  return playlists.filter((playlist) => {
    const playlistNameLower = playlist.name.toLowerCase();

    // Check if ANY keyword matches (case-insensitive partial match)
    return profile.keywords.some((keyword) => {
      const keywordLower = keyword.toLowerCase().trim();
      return keywordLower.length > 0 && playlistNameLower.includes(keywordLower);
    });
  });
}

/**
 * Get playlists grouped by music profiles
 * Note: Playlists can appear in multiple profiles if they match multiple keyword sets
 */
export function groupPlaylistsByProfiles(
  playlists: SpotifyPlaylist[],
  profiles: MusicProfile[]
): Map<string, SpotifyPlaylist[]> {
  const grouped = new Map<string, SpotifyPlaylist[]>();

  profiles.forEach((profile) => {
    const matchedPlaylists = filterPlaylistsByProfile(playlists, profile);
    grouped.set(profile.id, matchedPlaylists);
  });

  return grouped;
}
