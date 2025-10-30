'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MusicProfile } from '@/types';

export function useMusicProfiles() {
  const [profiles, setProfiles] = useState<MusicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all music profiles from Firebase
  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'musicProfiles'));
      const profilesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          keywords: data.keywords || [],
          color: data.color,
          icon: data.icon,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as MusicProfile;
      });

      setProfiles(profilesData);
    } catch (err) {
      console.error('Error fetching music profiles:', err);
      setError('Failed to load music profiles');
    } finally {
      setLoading(false);
    }
  };

  // Create a new music profile
  const createProfile = async (
    name: string,
    keywords: string[],
    color: string,
    icon?: string
  ): Promise<MusicProfile | null> => {
    try {
      const newProfile = {
        name,
        keywords: keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0),
        color,
        icon,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'musicProfiles'), newProfile);

      const createdProfile: MusicProfile = {
        id: docRef.id,
        ...newProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProfiles((prev) => [...prev, createdProfile]);
      return createdProfile;
    } catch (err) {
      console.error('Error creating music profile:', err);
      setError('Failed to create music profile');
      return null;
    }
  };

  // Update an existing music profile
  const updateProfile = async (
    id: string,
    updates: Partial<Omit<MusicProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> => {
    try {
      const profileRef = doc(db, 'musicProfiles', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      if (updates.keywords) {
        updateData.keywords = updates.keywords.map(k => k.toLowerCase().trim()).filter(k => k.length > 0);
      }

      await updateDoc(profileRef, updateData);

      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === id
            ? { ...profile, ...updates, updatedAt: new Date() }
            : profile
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating music profile:', err);
      setError('Failed to update music profile');
      return false;
    }
  };

  // Delete a music profile
  const deleteProfile = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'musicProfiles', id));
      setProfiles((prev) => prev.filter((profile) => profile.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting music profile:', err);
      setError('Failed to delete music profile');
      return false;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  };
}
