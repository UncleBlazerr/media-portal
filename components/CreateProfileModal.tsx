'use client';

import { useState } from 'react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, keywords: string[], color: string, icon: string) => Promise<void>;
}

const DEFAULT_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const DEFAULT_ICONS = ['🎵', '🎸', '🎹', '🎤', '🎧', '🎺', '🎻', '🥁', '🎼', '🎶', '🎙️', '📻'];

export default function CreateProfileModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProfileModalProps) {
  const [name, setName] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !keywordsInput.trim()) {
      alert('Please enter a profile name and at least one keyword');
      return;
    }

    // Split keywords by comma and clean them up
    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      alert('Please enter at least one keyword');
      return;
    }

    setIsCreating(true);

    try {
      await onCreate(name.trim(), keywords, selectedColor, selectedIcon);

      // Reset form
      setName('');
      setKeywordsInput('');
      setSelectedColor(DEFAULT_COLORS[0]);
      setSelectedIcon(DEFAULT_ICONS[0]);
      onClose();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Music Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Name */}
          <div className="mb-4">
            <label htmlFor="profile-name" className="block text-sm font-semibold mb-2">
              Profile Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Disney, Kids Music, Workout"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={50}
            />
          </div>

          {/* Keywords */}
          <div className="mb-4">
            <label htmlFor="keywords" className="block text-sm font-semibold mb-2">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="e.g., disney, frozen, moana"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Playlists matching ANY keyword will appear in this profile
            </p>
          </div>

          {/* Icon Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {DEFAULT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 text-2xl rounded-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-gray-700 ring-2 ring-green-500 scale-110'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Color</label>
            <div className="grid grid-cols-8 gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: selectedColor }}>
            <div className="text-center text-white">
              <div className="text-4xl mb-2">{selectedIcon}</div>
              <div className="font-bold">{name || 'Profile Name'}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
