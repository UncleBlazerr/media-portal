# Media Portal

A Netflix-style interface for Spotify - your personal music hub built with Next.js, Firebase, and Kubernetes.

## Features

- 🎵 **Spotify Integration** - Connect your Spotify account and control playback
- 👥 **Multi-Listener Profiles** - Create profiles for different users sharing one Spotify account
- 🎨 **Beautiful UI** - Netflix-inspired interface with smooth animations
- 📊 **Top Tracks** - View your top 5 most played songs
- 🕒 **Recently Played** - See your recently played tracks
- ➕ **Quick Add to Playlist** - Add currently playing song to a listener's playlist with one click
- 🖼️ **Album Art** - Automatic thumbnail extraction and display
- 🔄 **Real-time Updates** - Live updates of currently playing track
- ☁️ **Cloud Ready** - Full Docker/Kubernetes/Helm deployment support

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: Firebase Firestore
- **Music API**: Spotify Web API
- **Deployment**: Docker, Kubernetes, Helm
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 20+
- npm or yarn
- Spotify Developer Account
- Firebase Project
- Docker (for containerization)
- Kubernetes cluster (for deployment)
- Helm 3 (for deployment)

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd media-portal
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

The project is already configured with your credentials in `.env.local`. If you need to update them:

\`\`\`env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Spotify
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret
\`\`\`

### 4. Set Up Firebase

In your Firebase console, create the following collections:

**listeners** collection - Add listener profiles:
\`\`\`json
{
  "name": "John",
  "playlistId": "spotify-playlist-id",
  "color": "#1DB954",
  "avatar": "👤"
}
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

### Build Docker Image

\`\`\`bash
docker build -t eggystrone/media-portal:latest .
\`\`\`

### Run with Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

### Push to Registry

\`\`\`bash
./scripts/build-and-push.sh v1.0.0
\`\`\`

## Kubernetes Deployment

### Using kubectl

\`\`\`bash
# Create secret
kubectl create secret generic media-portal-secrets \\
  --from-literal=firebase-api-key=$FIREBASE_API_KEY \\
  --from-literal=spotify-client-id=$SPOTIFY_CLIENT_ID \\
  # ... add all secrets

# Apply manifests
kubectl apply -f k8s/
\`\`\`

### Using Helm

\`\`\`bash
# Deploy
./scripts/deploy-helm.sh

# Or manually
helm install media-portal ./helm/media-portal \\
  --set secrets.firebase.apiKey="your-key" \\
  # ... set all values
\`\`\`

## CI/CD Pipeline

The project includes a GitHub Actions workflow that:

1. Builds Docker image on every push
2. Pushes to Docker Hub
3. Deploys to Kubernetes cluster using Helm (on main branch)

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `KUBECONFIG` (base64 encoded)
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Project Structure

\`\`\`
media-portal/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   └── spotify/             # Spotify API routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main page
│   ├── providers.tsx            # Session provider
│   └── globals.css              # Global styles
├── components/
│   ├── ListenerSelector.tsx     # User profile selector
│   ├── NowPlaying.tsx          # Currently playing display
│   ├── TrackGrid.tsx           # Grid of tracks
│   └── TrackRow.tsx            # Horizontal track row
├── hooks/
│   ├── useFirebaseChannels.ts  # Firebase channels hook
│   ├── useFeaturedChannels.ts  # Featured channels hook
│   ├── useChannelSearch.ts     # Channel search hook
│   └── useUIState.ts           # UI state management
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   └── spotify.ts              # Spotify client
├── types/
│   └── index.ts                # TypeScript types
├── k8s/                        # Kubernetes manifests
├── helm/                       # Helm chart
├── scripts/                    # Deployment scripts
├── Dockerfile                  # Docker configuration
└── docker-compose.yml          # Docker Compose config
\`\`\`

## Custom Hooks

- **useFirebaseChannels**: Fetch all channels from Firebase
- **useFeaturedChannels**: Fetch featured channels only
- **useChannelSearch**: Search channels by name
- **useUIState**: Manage UI state (selected listener, view, etc.)

## API Routes

- **POST /api/spotify/add-to-playlist**: Add a track to a playlist
- **GET/POST /api/auth/[...nextauth]**: NextAuth authentication

## Future Enhancements

- YouTube channel integration
- Playlist management
- Advanced search functionality
- User analytics
- Mobile app
- Collaborative playlists
- Social features

## License

MIT

## Author

eggystrone
