'use client';

import { MusicProfile } from '@/types';

interface MusicProfileSelectorProps {
  profiles: MusicProfile[];
  selectedProfile: MusicProfile | null;
  onSelect: (profile: MusicProfile) => void;
  onCreateNew: () => void;
  onDelete: (profileId: string) => void;
  onClearSelection: () => void;
  loading?: boolean;
}

export default function MusicProfileSelector({
  profiles,
  selectedProfile,
  onSelect,
  onCreateNew,
  onDelete,
  onClearSelection,
  loading = false,
}: MusicProfileSelectorProps) {
  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Music Profiles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-40 bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Music Profiles</h2>
          {selectedProfile && (
            <p className="text-sm text-gray-400 mt-1">
              Actively Selected Profile: <span className="text-white font-semibold">{selectedProfile.name}</span>
            </p>
          )}
          {!selectedProfile && profiles.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Showing all playlists
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedProfile && (
            <button
              onClick={onClearSelection}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-semibold"
            >
              Show All
            </button>
          )}
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <span>+</span>
            Create Profile
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {profiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">No Music Profiles Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Create a profile with keywords to organize your Spotify playlists. For
              example, create a "Disney" profile with keywords like "disney", "frozen",
              "moana".
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
            >
              Create Your First Profile
            </button>
          </div>
        ) : (
          profiles.map((profile) => {
            const isSelected = selectedProfile?.id === profile.id;

            return (
              <div key={profile.id} className="flex-shrink-0 relative group">
                <button
                  onClick={() => onSelect(profile)}
                  className={`w-40 h-40 rounded-xl transition-all flex flex-col items-center justify-center gap-2 p-4 ${
                    isSelected
                      ? 'ring-4 ring-white ring-opacity-60 scale-105 shadow-2xl'
                      : 'hover:scale-105 hover:shadow-xl opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: profile.color }}
                >
                  <div className="text-5xl mb-2">{profile.icon || '🎵'}</div>
                  <div className="text-white font-bold text-center text-sm line-clamp-2">
                    {profile.name}
                  </div>
                  <div className="text-xs text-white text-opacity-80">
                    {profile.keywords.length} keyword{profile.keywords.length !== 1 ? 's' : ''}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${profile.name}"?`)) {
                      onDelete(profile.id);
                    }
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold shadow-lg"
                  title="Delete profile"
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedProfile && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{selectedProfile.icon || '🎵'}</span>
            <h3 className="text-lg font-semibold">{selectedProfile.name}</h3>
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-semibold">Keywords:</span>{' '}
            {selectedProfile.keywords.map((keyword, idx) => (
              <span key={idx}>
                <span className="text-gray-300">{keyword}</span>
                {idx < selectedProfile.keywords.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
