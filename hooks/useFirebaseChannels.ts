import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Channel } from '@/types';

export function useFirebaseChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'channels'), orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const channelsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Channel[];

        setChannels(channelsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching channels:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { channels, loading, error };
}
