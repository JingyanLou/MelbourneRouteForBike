# Use the official Node.js 16 image with Alpine base.
FROM node:16-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the local code to the container image.
COPY . .

# Clean up npm cache to reduce image size.
RUN npm cache clean --force

# Expose port 5000
EXPOSE 5000

# Run the web service on container startup.
CMD ["node", "src/server.js"]
