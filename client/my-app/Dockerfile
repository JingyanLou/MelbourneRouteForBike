# Stage 1: Build
FROM node:16-alpine AS build

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies with --legacy-peer-deps flag.
RUN npm install --legacy-peer-deps

# Copy the local code to the container image.
COPY . .

# Build the application.
RUN npm run build

# Stage 2: Runtime
FROM node:16-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the build output from the previous stage to the current stage.
COPY --from=build /usr/src/app/build /usr/src/app/build

# Install only production dependencies.
COPY package*.json ./
RUN npm install --production

# Clean up npm cache to reduce image size.
RUN npm cache clean --force

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
