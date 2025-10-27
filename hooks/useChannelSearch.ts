import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Channel } from '@/types';

export function useChannelSearch(searchTerm: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setChannels([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia or similar
    // This is a simple prefix search
    const searchTermLower = searchTerm.toLowerCase();
    const q = query(
      collection(db, 'channels'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const channelsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Channel[];

        // Filter on client side for now
        const filtered = channelsData.filter((channel) =>
          channel.name.toLowerCase().includes(searchTermLower)
        );

        setChannels(filtered);
        setLoading(false);
      },
      (err) => {
        console.error('Error searching channels:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [searchTerm]);

  return { channels, loading, error };
}
