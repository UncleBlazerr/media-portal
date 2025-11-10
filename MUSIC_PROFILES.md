# Music Profiles Feature

## Overview

Music Profiles allow you to organize your Spotify playlists by keywords. When you select a profile, only playlists matching that profile's keywords will be displayed.

### Quick Reference

| Component | Purpose | Data Source | State |
|-----------|---------|-------------|-------|
| `useMusicProfiles` | Firebase CRUD operations | Firestore `musicProfiles` collection | `profiles[]`, `loading`, `error` |
| `MusicProfileSelector` | Display & interact with profiles | Props from parent | Stateless (controlled) |
| `CreateProfileModal` | Create new profiles | User input form | Local form state |
| `app/page.tsx` | Orchestrate everything | Spotify API + Firebase | `selectedProfile`, `filteredPlaylists[]` |
| `playlistFilters.ts` | Filter logic | Pure functions | No state |

### Key Concepts

- **Profiles are global:** Stored in Firebase, shared across sessions
- **Selection is session-only:** Not persisted, resets on page reload
- **Filtering is client-side:** Happens in browser after fetching playlists
- **Keywords are OR logic:** Playlist matches if ANY keyword is found
- **Case-insensitive matching:** "Disney" = "disney" = "DISNEY"

## Architecture & Data Flow

### High-Level Flow

```
User Action → Component → Hook → Firebase → State Update → UI Render
```

### Components Structure

```
app/page.tsx (HomeContent)
├── MusicProfileSelector
│   ├── Profile Cards (with delete button)
│   ├── Create Profile Button
│   └── Show All Button
└── CreateProfileModal
    └── Profile Creation Form
```

### Data Flow Diagram

```
┌─────────────────┐
│   Firebase      │
│  musicProfiles  │
│   Collection    │
└────────┬────────┘
         │
         │ (fetch on mount)
         ▼
┌─────────────────┐
│ useMusicProfiles│ ◄──── CRUD Operations
│     Hook        │       - createProfile()
└────────┬────────┘       - deleteProfile()
         │                - fetchProfiles()
         │ (returns)
         ▼
┌─────────────────┐
│  HomeContent    │
│   (app/page)    │
│                 │
│  State:         │
│  - profiles[]   │
│  - selectedProfile
│  - allPlaylists[]
│  - filteredPlaylists[]
└────────┬────────┘
         │
         │ (pass props)
         ▼
┌─────────────────┐
│ MusicProfile    │
│   Selector      │
│                 │
│  - Display      │
│  - Select       │
│  - Delete       │
│  - Clear        │
└─────────────────┘
```

## Firebase Integration

### Collection: `musicProfiles`

**Location:** Firestore Database
**Purpose:** Store user-created music profiles with keywords for playlist filtering

### Firebase Operations Flow

#### 1. **Fetch Profiles (on app load)**
```
Component Mount
    ↓
useMusicProfiles() hook initializes
    ↓
useEffect() runs
    ↓
fetchProfiles() called
    ↓
getDocs(collection(db, 'musicProfiles'))
    ↓
Transform Firestore docs to MusicProfile[]
    ↓
setProfiles(profilesData)
    ↓
UI renders profile cards
```

#### 2. **Create Profile**
```
User fills form in CreateProfileModal
    ↓
User clicks "Create Profile"
    ↓
onCreate(name, keywords, color, icon) callback
    ↓
handleCreateProfile() in app/page.tsx
    ↓
createProfile() in useMusicProfiles hook
    ↓
addDoc(collection(db, 'musicProfiles'), {
    name,
    keywords: [...], // normalized to lowercase
    color,
    icon,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
})
    ↓
Add to local state: setProfiles([...prev, newProfile])
    ↓
Auto-select new profile: setSelectedProfile(newProfile)
    ↓
Refresh Spotify playlists
    ↓
Filter playlists by new profile's keywords
```

#### 3. **Delete Profile**
```
User hovers over profile card
    ↓
Delete button (×) appears
    ↓
User clicks delete
    ↓
Confirmation dialog shown
    ↓
User confirms
    ↓
onDelete(profileId) callback
    ↓
handleDeleteProfile() in app/page.tsx
    ↓
deleteProfile() in useMusicProfiles hook
    ↓
deleteDoc(doc(db, 'musicProfiles', id))
    ↓
Remove from local state: setProfiles(prev.filter(...))
    ↓
Check if deleted profile was selected
    ↓
If yes: setSelectedProfile(null) → Show all playlists
```

#### 4. **Profile Selection**
```
User clicks profile card
    ↓
onSelect(profile) callback
    ↓
handleProfileSelect() in app/page.tsx
    ↓
setSelectedProfile(profile)
    ↓
Fetch fresh Spotify data
    ↓
useEffect() detects selectedProfile change
    ↓
filterPlaylistsByProfile(allPlaylists, selectedProfile)
    ↓
setFilteredPlaylists(filtered)
    ↓
Update UI to show only matching playlists
```

#### 5. **Clear Selection (Show All)**
```
User clicks "Show All" button
    ↓
onClearSelection() callback
    ↓
handleClearSelection() in app/page.tsx
    ↓
setSelectedProfile(null)
    ↓
useEffect() detects selectedProfile = null
    ↓
setFilteredPlaylists(allPlaylists)
    ↓
UI shows all playlists
```

### State Management

**Key State Variables (app/page.tsx):**

```typescript
// From useMusicProfiles hook
profiles: MusicProfile[]        // All profiles from Firebase
loading: boolean                // Firebase fetch loading state
error: string | null            // Firebase operation errors

// Local component state
selectedProfile: MusicProfile | null  // Currently active profile
allPlaylists: SpotifyPlaylist[]       // All user's Spotify playlists
filteredPlaylists: SpotifyPlaylist[]  // Filtered by selected profile
```

**State Synchronization:**

1. `profiles[]` syncs with Firebase on:
   - Component mount (initial fetch)
   - After create (local + Firebase)
   - After delete (local + Firebase)

2. `filteredPlaylists[]` updates when:
   - `selectedProfile` changes
   - `allPlaylists` changes
   - Profile is cleared (shows all)

3. **Important:** Profile selection is **not** persisted to Firebase or localStorage - it's session-only state

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

## File Structure & Responsibilities

### Core Files

#### `hooks/useMusicProfiles.ts`
**Purpose:** Custom React hook for Firebase operations
**Responsibilities:**
- Fetch all profiles from Firebase on mount
- Create new profiles (with data normalization)
- Update existing profiles
- Delete profiles
- Maintain local state synchronized with Firebase
- Error handling for all Firebase operations

**Key Functions:**
```typescript
fetchProfiles()     // GET all profiles from Firestore
createProfile()     // POST new profile to Firestore
updateProfile()     // PUT update to Firestore (not currently used in UI)
deleteProfile()     // DELETE from Firestore
```

#### `lib/playlistFilters.ts`
**Purpose:** Pure functions for playlist filtering logic
**Responsibilities:**
- Filter playlists based on profile keywords
- Case-insensitive and partial matching
- No side effects or state management

**Key Functions:**
```typescript
filterPlaylistsByProfile(playlists, profile)
  // Returns playlists matching ANY keyword in profile

groupPlaylistsByProfiles(playlists, profiles)
  // Returns Map<profileId, matchingPlaylists[]>
```

#### `components/MusicProfileSelector.tsx`
**Purpose:** Display and interact with music profiles
**Responsibilities:**
- Render profile cards in horizontal carousel
- Show "Actively Selected Profile" indicator
- Display "Show All" button when profile is selected
- Show delete button (×) on hover for each profile
- Handle profile selection
- Trigger profile deletion with confirmation
- Display selected profile details (keywords, icon)

**Props:**
```typescript
profiles[]           // All available profiles
selectedProfile     // Currently active profile (or null)
onSelect()          // Callback when user clicks a profile
onCreateNew()       // Open create modal
onDelete()          // Delete a profile
onClearSelection()  // Clear selection and show all playlists
loading            // Show skeleton loaders
```

#### `components/CreateProfileModal.tsx`
**Purpose:** Modal form for creating new profiles
**Responsibilities:**
- Form validation (name required, keywords required)
- Keyword input parsing (comma-separated)
- Color picker (predefined colors)
- Icon selector (emoji picker)
- Call onCreate callback with validated data

#### `app/page.tsx` (HomeContent component)
**Purpose:** Main app logic and state orchestration
**Responsibilities:**
- Initialize useMusicProfiles hook
- Manage selectedProfile state
- Fetch Spotify playlists
- Filter playlists based on selected profile
- Handle profile creation/deletion/selection
- Coordinate between Spotify API and Firebase
- Render all child components

**Key State Flow:**
```typescript
profiles (from Firebase)
    ↓
selectedProfile (user selection)
    ↓
allPlaylists (from Spotify API)
    ↓
filteredPlaylists (computed from profile + playlists)
    ↓
UI updates
```

### Type Definitions

#### `types/index.ts`
```typescript
interface MusicProfile {
  id: string;              // Firestore document ID
  name: string;            // Display name
  keywords: string[];      // Lowercase search terms
  color: string;           // Hex color for UI
  icon?: string;           // Emoji icon
  createdAt?: Date;        // Creation timestamp
  updatedAt?: Date;        // Last update timestamp
}
```

## Features

✅ **Create Profiles** - Easy modal-based creation with validation
✅ **Delete Profiles** - Hover to reveal delete button with confirmation
✅ **Active Profile Indicator** - Shows which profile is currently selected
✅ **Show All Playlists** - Clear selection to view all playlists
✅ **Graceful Fallback** - When no profile selected, displays all playlists
✅ **Multiple Keywords** - Support for multiple search terms per profile
✅ **Visual Customization** - Choose colors and icons
✅ **Auto-Refresh** - Automatically refresh playlists when switching profiles
✅ **Manual Refresh** - Button to re-fetch and re-filter playlists
✅ **Responsive UI** - Horizontal scrolling carousel
✅ **Firebase Sync** - Real-time state management with Firestore
✅ **Smart State Management** - Automatic cleanup on profile deletion
✅ **Clean Code** - Organized, well-structured, efficient implementation

## Tips

1. **Broad keywords**: Use general terms like "disney" instead of specific titles
2. **Multiple keywords**: Add variations (e.g., `kids, children, nursery, baby`)
3. **Test your keywords**: Create a profile and see what playlists match
4. **Use the refresh button**: After creating a new profile, refresh to see results
5. **Profile colors**: Use different colors to easily identify profiles

## Common Scenarios & Troubleshooting

### Scenario 1: Profile shows 0 playlists
**Cause:** Keywords don't match any playlist names
**Solution:**
- Click "Refresh Playlists" to ensure you have latest data
- Try broader keywords (e.g., "kids" instead of "kids music for toddlers")
- Check spelling of keywords
- Use the "Show All" button to verify playlists exist

### Scenario 2: Deleted profile but still seeing it
**Cause:** UI state hasn't updated
**Solution:**
- Refresh the page (should auto-fetch from Firebase)
- Check browser console for Firebase errors
- Verify Firebase connection is active

### Scenario 3: Profile deleted accidentally
**Cause:** Clicked delete and confirmed
**Solution:**
- No undo feature - need to recreate manually
- Profile data is permanently deleted from Firebase
- Future: Could implement soft delete or archive feature

### Scenario 4: Can't see any playlists after selecting profile
**Cause:** No playlists match the keywords
**Solution:**
- Click the "Show All" button to clear selection
- This will show all your Spotify playlists
- Edit your keywords to be more inclusive

### Scenario 5: Want to temporarily see all playlists
**Cause:** Profile is filtering too aggressively
**Solution:**
- Click "Show All" button (appears when profile is selected)
- This clears the selection without deleting the profile
- Select the profile again when needed

## Future Enhancements

Possible improvements:
- ✅ ~~Delete profiles~~ (Implemented)
- ✅ ~~Show all playlists when no profile selected~~ (Implemented)
- ✅ ~~Active profile indicator~~ (Implemented)
- Edit existing profiles (currently can only create/delete)
- Persist selected profile across sessions (localStorage)
- Regex or advanced pattern matching
- Exclude keywords (match playlists that DON'T contain certain words)
- AND logic for keywords (require ALL keywords instead of ANY)
- Profile templates (pre-made profiles for common use cases)
- Share profiles with other users
- Import/Export profiles as JSON
- Profile usage analytics (most used profile, etc.)
