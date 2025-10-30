# Architecture Overview

Media Portal is a Netflix-style Spotify interface built with Next.js, deployed on Kubernetes.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Next.js App (Port 3000)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (React Components)                      │   │
│  │  - ListenerSelector, NowPlaying, TrackRow        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes                                       │   │
│  │  - /api/auth/[...nextauth] (OAuth)              │   │
│  │  - /api/spotify/add-to-playlist                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────┬──────────────────────────┬────────────────────────┘
      │                          │
      ▼                          ▼
┌─────────────┐          ┌──────────────────┐
│  Spotify    │          │  Firebase        │
│  Web API    │          │  Firestore       │
│             │          │                  │
│  - OAuth    │          │  - Listeners     │
│  - Playback │          │  - Profiles      │
│  - Playlists│          │                  │
└─────────────┘          └──────────────────┘
```

## Tech Stack

**Frontend & Backend**
- Next.js 15 (App Router) - React framework with server-side rendering
- TypeScript - Type safety
- Tailwind CSS - Styling
- NextAuth.js - Spotify OAuth authentication

**Data Sources**
- Firebase Firestore - Listener profiles only (name, playlistId, color, avatar)
- Spotify Web API - Music playback, playlists, tracks, everything else

**Infrastructure**
- Docker - Containerization with multi-stage builds
- Kubernetes - Container orchestration (2 replicas for HA)
- Helm - Package management and templated deployments
- GitHub Actions - CI/CD automation

## Project Structure

```
media-portal/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # NextAuth OAuth
│   │   └── spotify/       # Spotify integration
│   └── page.tsx           # Main UI
│
├── components/            # React components
│   ├── ListenerSelector   # Profile selection
│   ├── NowPlaying        # Current track display
│   └── TrackRow          # Track carousels
│
├── lib/                  # Core logic
│   ├── firebase.ts       # Firestore client
│   ├── spotify.ts        # Spotify API wrapper
│   └── auth.ts           # NextAuth config
│
├── hooks/                # Custom React hooks
│   └── useFirebaseChannels.ts
│
├── k8s/                  # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
│
└── helm/                 # Helm chart
    └── media-portal/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
```

## How It Works

### 1. Authentication Flow
1. User clicks "Connect with Spotify"
2. NextAuth redirects to Spotify OAuth
3. User grants permissions (15 scopes for playback, playlists, profile)
4. Spotify returns access + refresh tokens
5. Tokens stored in JWT session
6. Automatic token refresh on expiry

### 2. Data Flow
1. **On Load**: Fetch user's top tracks, recently played, and playlists from Spotify
2. **Listener Selection**: Load listener profiles from Firebase (name, playlistId, avatar)
3. **Now Playing**: Poll Spotify API every 5 seconds for current track
4. **Playback Control**: Send play commands directly to Spotify API
5. **Add to Playlist**: POST to `/api/spotify/add-to-playlist` → Spotify API

### 3. Key Components

**SpotifyClient** (`lib/spotify.ts`)
- Handles all Spotify Web API interactions
- Methods: `getTopTracks()`, `playTrack()`, `addTrackToPlaylist()`, etc.
- Automatic token refresh

**Firebase Integration** (`lib/firebase.ts`)
- **Only used by ListenerSelector component**
- Stores listener profiles in Firestore `listeners` collection
- Schema: `{ name, playlistId, color, avatar }`
- Note: Some Firebase hooks exist (`useFirebaseChannels`, etc.) but are unused legacy code

**NowPlaying Component**
- Real-time polling (5s intervals)
- Progress bar calculation
- Album art display

## Deployment Architecture

### Docker Build (Multi-stage)
```dockerfile
Stage 1: Builder
- Install all dependencies
- Build Next.js app
- Output: .next/ folder

Stage 2: Runner (Production)
- Copy only production dependencies
- Copy built app
- Run as non-root user (nextjs:1001)
- Expose port 3000
```

### Kubernetes Setup
```yaml
Deployment:
  Replicas: 2                    # High availability
  Resources:
    CPU: 250m - 500m
    Memory: 256Mi - 512Mi
  Health Checks:
    Liveness: HTTP GET / (10s)
    Readiness: HTTP GET / (5s)

Service:
  Type: ClusterIP
  Port: 3000

ConfigMap:
  NEXTAUTH_URL: https://uncleblazermedia.com

Secrets:
  - Firebase config (7 vars)
  - Spotify credentials
  - NextAuth secret
```

### Helm Chart
- Templated Kubernetes manifests
- Centralized configuration in `values.yaml`
- Easy environment-specific deployments

## CI/CD Pipeline

**Trigger**: Push to `main` or Pull Request

### Build Job (All Pushes)
1. Checkout code
2. Set up Docker Buildx
3. Login to Docker Hub
4. Build image with Firebase config as build args
5. Tag: `main-{SHA}` and `latest`
6. Push to `eggystrone/media-portal` (only on push, not PR)
7. Cache layers using GitHub Actions cache

### Deploy Job (Main Branch Only)
1. Checkout code
2. Set up kubectl and Helm
3. Decode base64 KUBECONFIG from secrets
4. Deploy with Helm:
   ```bash
   helm upgrade --install media-portal ./helm/media-portal \
     --set image.tag=main-{SHA} \
     --set secrets.firebase.* \
     --set secrets.spotify.* \
     --wait --timeout 5m
   ```
5. Verify rollout status

**Result**: Automatic deployment to https://uncleblazermedia.com on every main branch push

## Environment Variables

**Build Time** (Docker build args)
- `NEXT_PUBLIC_FIREBASE_*` (7 variables) - Firebase SDK config

**Runtime** (K8s secrets)
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` - Spotify OAuth
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` - Authentication

## Key Features

1. **Multi-Listener Support** - Multiple profiles per Spotify account
2. **Real-time Playback** - Live updates every 5 seconds
3. **Quick Actions** - One-click add to listener playlists
4. **High Availability** - 2 replicas with health checks
5. **Zero-Downtime Deploys** - Rolling updates with readiness probes

## Development

```bash
# Local development
npm install
npm run dev                 # Port 3000

# Docker local
docker-compose up -d

# Deploy to K8s
./scripts/deploy-helm.sh
```

## Monitoring

- Kubernetes liveness probe: HTTP GET `/` every 10s
- Kubernetes readiness probe: HTTP GET `/` every 5s
- Resource limits prevent OOM kills
- Rollout status verification in CI/CD
