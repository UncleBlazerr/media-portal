import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SpotifyClient } from '@/lib/spotify';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playlistId, trackUri } = await request.json();

    if (!playlistId || !trackUri) {
      return NextResponse.json(
        { error: 'Missing playlistId or trackUri' },
        { status: 400 }
      );
    }

    const spotify = new SpotifyClient(session.accessToken);
    const success = await spotify.addTrackToPlaylist(playlistId, trackUri);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to add track to playlist' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
