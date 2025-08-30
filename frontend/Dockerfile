FROM node:alpine3.22 AS build

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG FRONTEND_PORT=5173
ARG BACKEND_PORT=8881
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} \
	FRONTEND_PORT=${FRONTEND_PORT} \
	BACKEND_PORT=${BACKEND_PORT} \
	VITE_DOCKER_ENV=true

# Build production bundle
RUN pnpm run build

# --- Runtime Stage ---
FROM node:alpine3.22 AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only built assets + minimal files
COPY --from=build /app/dist ./dist

# Lightweight static file server
RUN npm install -g serve

ARG FRONTEND_PORT=5173
ENV FRONTEND_PORT=${FRONTEND_PORT}
EXPOSE ${FRONTEND_PORT}

CMD ["sh", "-c", "serve -s dist -l $FRONTEND_PORT"]