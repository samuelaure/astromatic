# Base remotion image with Chromium and FFmpeg
FROM ghcr.io/remotion-dev/template-helloworld:latest

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create output directory
RUN mkdir -p out

# Default command
CMD ["npm", "start"]
