# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install backend dependencies
RUN npm install --only=production

# Copy backend source code
COPY . .

# Install frontend dependencies
RUN cd client && npm install --only=production

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]