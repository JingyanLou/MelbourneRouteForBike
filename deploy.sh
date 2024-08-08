#!/bin/bash

# Print debug information
echo "Docker username: $DOCKER_USERNAME"

# Navigate to the home directory of the ubuntu user
cd /home/ubuntu

# Pull the latest Docker images
docker pull $DOCKER_USERNAME/my-app-frontend:latest
docker pull $DOCKER_USERNAME/my-app-backend:latest

# Stop and remove the existing frontend container if it is running
if [ "$(docker ps -q -f name=frontend)" ]; then
    docker stop frontend
    docker rm frontend
fi

# Stop and remove the existing backend container if it is running
if [ "$(docker ps -q -f name=backend)" ]; then
    docker stop backend
    docker rm backend
fi

# Run the frontend container
docker run -d --name frontend -p 80:3000 $DOCKER_USERNAME/my-app-frontend:latest

# Run the backend container
docker run -d --name backend -p 5000:5000 $DOCKER_USERNAME/my-app-backend:latest
