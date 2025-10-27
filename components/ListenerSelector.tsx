'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ListenerProfile } from '@/types';

interface ListenerSelectorProps {
  selectedListener: ListenerProfile | null;
  onSelect: (listener: ListenerProfile) => void;
}

export default function ListenerSelector({ selectedListener, onSelect }: ListenerSelectorProps) {
  const [listeners, setListeners] = useState<ListenerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListeners() {
      try {
        const querySnapshot = await getDocs(collection(db, 'listeners'));
        const listenersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ListenerProfile[];

        setListeners(listenersData);
      } catch (error) {
        console.error('Error fetching listeners:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListeners();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 p-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      {listeners.map((listener) => (
        <button
          key={listener.id}
          onClick={() => onSelect(listener)}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
            selectedListener?.id === listener.id
              ? 'bg-opacity-20 ring-2 ring-opacity-60'
              : 'hover:bg-gray-800'
          }`}
          style={{
            backgroundColor: selectedListener?.id === listener.id ? listener.color : undefined,
            borderColor: selectedListener?.id === listener.id ? listener.color : undefined,
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: listener.color }}
          >
            {listener.avatar || listener.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{listener.name}</span>
        </button>
      ))}
    </div>
  );
}
