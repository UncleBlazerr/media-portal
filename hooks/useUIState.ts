import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UIState, ListenerProfile } from '@/types';

const DEFAULT_UI_STATE: UIState = {
  selectedListener: null,
  currentView: 'home',
  isLoading: false,
};

export function useUIState(userId: string) {
  const [uiState, setUIState] = useState<UIState>(DEFAULT_UI_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'uiState', userId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUIState(snapshot.data() as UIState);
        } else {
          setUIState(DEFAULT_UI_STATE);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching UI state:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const updateUIState = async (updates: Partial<UIState>) => {
    if (!userId) return;

    const docRef = doc(db, 'uiState', userId);
    const newState = { ...uiState, ...updates };

    try {
      await setDoc(docRef, newState, { merge: true });
      setUIState(newState);
    } catch (error) {
      console.error('Error updating UI state:', error);
    }
  };

  const selectListener = (listener: ListenerProfile | null) => {
    updateUIState({ selectedListener: listener });
  };

  const setView = (view: UIState['currentView']) => {
    updateUIState({ currentView: view });
  };

  return {
    uiState,
    loading,
    updateUIState,
    selectListener,
    setView,
  };
}
