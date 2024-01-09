# Use the official Node.js base image
FROM node:20-alpine as builder

ENV NODE_ENV=production

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

RUN npm run build

# Start building the final image
FROM node:20-alpine

# Set the working directory for the application
WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY . .
COPY --from=builder /usr/src/app/dist ./dist

# Install production dependencies
RUN rm -Rf src && \
    npm --prefix server install --ommit=dev && \
    npm install -g pm2 && \
    npm cache clean --force

# Set a default value for environment variable, can be overridden during runtime
ENV NODE_ENV=production

# Expose the port on which your Express app is running
EXPOSE 8081
ENV PORT=8081

# Start the Express server with PM2
CMD ["pm2-runtime", "server/server.js"]
