#!/bin/bash

# Build and push script for media-portal
# Usage: ./scripts/build-and-push.sh [version]

set -e

VERSION=${1:-latest}
IMAGE_NAME="eggystrone/media-portal"

echo "Building Docker image: ${IMAGE_NAME}:${VERSION}"

# Build the Docker image
docker build -t ${IMAGE_NAME}:${VERSION} .

# Also tag as latest if version is specified
if [ "$VERSION" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest
fi

echo "Pushing Docker image to registry..."

# Push the image
docker push ${IMAGE_NAME}:${VERSION}

if [ "$VERSION" != "latest" ]; then
    docker push ${IMAGE_NAME}:latest
fi

echo "Successfully built and pushed ${IMAGE_NAME}:${VERSION}"
