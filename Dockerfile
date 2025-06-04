FROM node:20

# Define build arguments that will be passed from GCP Cloud Build
ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG GCR_CI
ARG SENTRY_AUTH_TOKEN

# Set as environment variables
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV GCR_CI=$GCR_CI
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies including dev dependencies needed for build
RUN npm install --force

# Copy local code to the container image.
COPY . .

# Build the application using build-env.ts
# Any environment variables like SENTRY_* will be used from the environment
RUN npm run build

# Run the web service on container startup.
# Real environment variables will be validated at runtime via env.ts
CMD [ "npm", "run", "start:docker" ]

# Inform Docker that the container listens on port 8080.
EXPOSE 8080
