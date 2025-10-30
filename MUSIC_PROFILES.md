# Music Profiles Feature

## Overview

Music Profiles allow you to organize your Spotify playlists by keywords. When you select a profile, only playlists matching that profile's keywords will be displayed.

## How It Works

### Keyword Matching
- **Case-insensitive**: "disney" matches "Disney", "DISNEY", "DiSnEy"
- **Partial matching**: "frozen" matches "Frozen Soundtrack", "Best of Frozen", etc.
- **Multiple keywords**: A playlist matches if it contains ANY of the profile's keywords
- **Multi-profile**: Playlists can appear in multiple profiles if they match multiple keyword sets

### Example

**Profile: "Disney"**
- Keywords: `disney`, `frozen`, `moana`, `encanto`
- Will match playlists:
  - "Disney Classics"
  - "Frozen 2 Soundtrack"
  - "Best of Moana"
  - "DISNEY PARTY MIX"

## Usage

### 1. Create a Music Profile

1. Click **"Create Profile"** button at the top
2. Enter a profile name (e.g., "Disney", "Kids Music", "Workout")
3. Add keywords (comma-separated): `disney, frozen, moana`
4. Select an icon (🎵, 🎸, 🎹, etc.)
5. Choose a color
6. Click **"Create Profile"**

### 2. Select a Profile

Click on any profile tile in the carousel at the top of the page. The app will:
- Fetch your latest Spotify playlists
- Filter them based on the profile's keywords
- Display only matching playlists

### 3. Refresh Playlists

Click the **"Refresh Playlists"** button to:
- Re-fetch all playlists from your Spotify account
- Re-apply keyword filtering
- Update the displayed playlists

This is useful when:
- You've added new playlists to Spotify during your session
- You've created a new profile and want to see results

### 4. Work with Filtered Playlists

Once a profile is selected:
- The playlist dropdown shows only filtered playlists
- You can select a playlist to view its tracks
- Add songs to the selected playlist using the + button
- All the existing functionality works with filtered playlists

## Firebase Schema

**Collection: `musicProfiles`**

```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Profile name (e.g., "Disney")
  keywords: string[];      // Array of keywords (stored lowercase)
  color: string;           // Hex color (e.g., "#8B5CF6")
  icon: string;            // Emoji icon (e.g., "🎵")
  createdAt: Timestamp;    // Creation timestamp
  updatedAt: Timestamp;    // Last update timestamp
}
```

## Files Created/Modified

### New Files
- `types/index.ts` - Added `MusicProfile` interface
- `hooks/useMusicProfiles.ts` - Firebase CRUD operations for music profiles
- `lib/playlistFilters.ts` - Playlist filtering logic
- `components/MusicProfileSelector.tsx` - Profile carousel component
- `components/CreateProfileModal.tsx` - Profile creation modal

### Modified Files
- `app/page.tsx` - Integrated music profiles functionality
- `tailwind.config.ts` - Added scrollbar-hide utility

## Features

✅ **Create Profiles** - Easy modal-based creation
✅ **Multiple Keywords** - Support for multiple search terms per profile
✅ **Visual Customization** - Choose colors and icons
✅ **Auto-Refresh** - Automatically refresh playlists when switching profiles
✅ **Manual Refresh** - Button to re-fetch and re-filter playlists
✅ **Responsive UI** - Horizontal scrolling carousel
✅ **Clean Code** - Organized, well-structured, efficient implementation

## Tips

1. **Broad keywords**: Use general terms like "disney" instead of specific titles
2. **Multiple keywords**: Add variations (e.g., `kids, children, nursery, baby`)
3. **Test your keywords**: Create a profile and see what playlists match
4. **Use the refresh button**: After creating a new profile, refresh to see results
5. **Profile colors**: Use different colors to easily identify profiles

## Future Enhancements

Possible improvements:
- Edit existing profiles (currently can only create/delete)
- Regex or advanced pattern matching
- Exclude keywords (match playlists that DON'T contain certain words)
- Profile templates (pre-made profiles for common use cases)
- Share profiles with other users
