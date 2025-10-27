# Media Portal Setup Guide

## Quick Start Steps

### 1. Update Spotify Redirect URI

Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and update your app's Redirect URI to include:
- `http://localhost:3000/api/auth/callback/spotify`

### 2. Create Listener Profiles in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `uncleblazer-media-portal`
3. Click "Firestore Database" in the left sidebar
4. Click "Start collection"
5. Collection ID: `listeners`
6. Add documents with the following structure:

**Example Listener Document:**

Document ID: `listener1` (auto-generated)

Fields:
```
name: "John" (string)
playlistId: "37i9dQZF1DXcBWIGoYBM5M" (string) - Get this from Spotify playlist URI
color: "#1DB954" (string) - Hex color code
avatar: "👤" (string) - Optional emoji or leave blank
```

**How to get Spotify Playlist ID:**
1. Open Spotify
2. Go to the playlist you want to use
3. Click the three dots → Share → Copy link to playlist
4. URL looks like: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
5. The ID is the last part: `37i9dQZF1DXcBWIGoYBM5M`

**Suggested Colors:**
- Green: `#1DB954` (Spotify green)
- Blue: `#1E3A8A`
- Purple: `#7C3AED`
- Red: `#DC2626`
- Orange: `#EA580C`

Add as many listener profiles as you want!

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Update `.env.local` with the generated secret:
```
NEXTAUTH_SECRET=your-generated-secret-here
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. First Time Login

1. Click "Connect with Spotify"
2. Authorize the application
3. You'll be redirected back to the portal
4. Select a listener profile at the top
5. Start playing music on Spotify
6. The currently playing song will appear
7. Click "Add to [Name]'s Playlist" to add the current song

## Docker Deployment

### Local Docker Testing

```bash
# Build the image
docker build -t eggystrone/media-portal:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build and push
./scripts/build-and-push.sh v1.0.0
```

## Kubernetes Deployment

### Prerequisites

- Running Kubernetes cluster
- kubectl configured
- Helm 3 installed

### Deploy with Helm

```bash
# Make script executable
chmod +x scripts/deploy-helm.sh

# Deploy
./scripts/deploy-helm.sh
```

### Manual Helm Deployment

```bash
helm install media-portal ./helm/media-portal \
  --set image.tag=latest \
  --set secrets.firebase.apiKey="AIzaSyCjKiFdCdr_6QqUnl594bzq9PSFG8l7lwg" \
  --set secrets.firebase.authDomain="uncleblazer-media-portal.firebaseapp.com" \
  --set secrets.firebase.projectId="uncleblazer-media-portal" \
  --set secrets.firebase.storageBucket="uncleblazer-media-portal.firebasestorage.app" \
  --set secrets.firebase.messagingSenderId="517393411761" \
  --set secrets.firebase.appId="1:517393411761:web:217ef44bc64f129251fc90" \
  --set secrets.firebase.measurementId="G-S2D3JM1T5J" \
  --set secrets.spotify.clientId="4faedb19fe2b4188ae54e9a0bc5022fd" \
  --set secrets.spotify.clientSecret="1d1e4939bdd34d52bc7c5542da3a9471" \
  --set secrets.nextauth.secret="your-nextauth-secret" \
  --set env.nextauthUrl="http://your-domain.com"
```

### Check Deployment Status

```bash
# Check pods
kubectl get pods -l app.kubernetes.io/name=media-portal

# Check service
kubectl get svc media-portal

# View logs
kubectl logs -l app.kubernetes.io/name=media-portal -f

# Get service URL (if LoadBalancer)
kubectl get svc media-portal -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## CI/CD with GitHub Actions

### Setup

1. Create a new repository on GitHub
2. Push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

3. Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Docker Hub:**
- `DOCKER_USERNAME`: eggystrone
- `DOCKER_PASSWORD`: Your Docker Hub password or token

**Kubernetes:**
- `KUBECONFIG`: Base64 encoded kubeconfig file
  ```bash
  cat ~/.kube/config | base64 -w 0
  ```

**Application Secrets:**
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

### Automatic Deployment

Once configured, every push to `main` branch will:
1. Build a new Docker image
2. Push to Docker Hub
3. Deploy to your Kubernetes cluster via Helm

## Troubleshooting

### "No song currently playing"
- Make sure Spotify is actively playing on any device
- The Spotify API only returns data when music is playing

### Listener profiles not showing
- Check Firebase Firestore has the `listeners` collection
- Verify document structure matches the example above

### Authentication fails
- Verify Spotify redirect URI matches exactly
- Check that all environment variables are set correctly
- Ensure NEXTAUTH_URL matches your domain

### Docker build fails
- Clear Docker cache: `docker builder prune`
- Rebuild: `docker build --no-cache -t eggystrone/media-portal:latest .`

### Kubernetes pod crashes
- Check logs: `kubectl logs <pod-name>`
- Verify all secrets are set correctly
- Check resource limits

## Next Steps

1. Set up your listener profiles in Firebase
2. Start the dev server and test locally
3. Build and test with Docker
4. Deploy to Kubernetes
5. Set up GitHub Actions for CI/CD
6. Add your YouTube channels (future feature)

## Support

For issues or questions, check:
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Helm Documentation](https://helm.sh/docs/)
