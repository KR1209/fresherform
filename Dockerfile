# Use an official Node.js runtime as the base image
FROM node:16

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port (must match the one used in server.js and docker-compose.yml)
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]
