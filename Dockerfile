# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project (excluding files in .dockerignore)
COPY . .

# Build the NestJS application
# RUN npm run build

# Expose the application port (default for NestJS is 3000)
EXPOSE 3000

# Command to run the app in production mode
CMD ["npm", "run", "start:dev"]
