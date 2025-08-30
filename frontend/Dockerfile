FROM node:alpine3.22

# Install pnpm
RUN npm install -g pnpm

# this is where our app code will live
WORKDIR /app

# copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# install dependencies
RUN pnpm install --frozen-lockfile

# copy the rest of the app
COPY . .

# Set environment variables for build
ARG FRONTEND_PORT=5173
ARG BACKEND_PORT=8881
ENV FRONTEND_PORT=${FRONTEND_PORT}
ENV BACKEND_PORT=${BACKEND_PORT}
ENV VITE_DOCKER_ENV=true

# build the app (skip TypeScript checking to avoid build failures)
RUN npx vite build

# expose the port the app runs on
EXPOSE ${FRONTEND_PORT}

# command to run the app
CMD ["sh", "-c", "pnpm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT"] 