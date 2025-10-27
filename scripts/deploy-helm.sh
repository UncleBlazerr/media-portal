#!/bin/bash

# Deploy using Helm
# Usage: ./scripts/deploy-helm.sh

set -e

RELEASE_NAME="media-portal"
NAMESPACE="default"
CHART_PATH="./helm/media-portal"

echo "Deploying ${RELEASE_NAME} using Helm..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found"
    exit 1
fi

# Source environment variables
source .env.local

# Deploy with Helm
helm upgrade --install ${RELEASE_NAME} ${CHART_PATH} \
    --namespace ${NAMESPACE} \
    --set image.tag=latest \
    --set secrets.firebase.apiKey="${NEXT_PUBLIC_FIREBASE_API_KEY}" \
    --set secrets.firebase.authDomain="${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}" \
    --set secrets.firebase.projectId="${NEXT_PUBLIC_FIREBASE_PROJECT_ID}" \
    --set secrets.firebase.storageBucket="${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}" \
    --set secrets.firebase.messagingSenderId="${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" \
    --set secrets.firebase.appId="${NEXT_PUBLIC_FIREBASE_APP_ID}" \
    --set secrets.firebase.measurementId="${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}" \
    --set secrets.spotify.clientId="${SPOTIFY_CLIENT_ID}" \
    --set secrets.spotify.clientSecret="${SPOTIFY_CLIENT_SECRET}" \
    --set secrets.nextauth.secret="${NEXTAUTH_SECRET}" \
    --set env.nextauthUrl="${NEXTAUTH_URL}" \
    --wait \
    --timeout 5m

echo "Deployment complete!"
echo "Checking deployment status..."

kubectl rollout status deployment/${RELEASE_NAME}
kubectl get pods -l app.kubernetes.io/name=media-portal
kubectl get svc ${RELEASE_NAME}

echo ""
echo "To get the service URL, run:"
echo "kubectl get svc ${RELEASE_NAME}"
