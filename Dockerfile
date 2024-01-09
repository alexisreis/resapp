FROM node:alpine
WORKDIR /app
COPY ./ ./
RUN npm ci
RUN npm run build

# Expose the port
EXPOSE 3002

# /bin/npm or the container does not find npm
CMD ["/bin/npm", "run", "start"]