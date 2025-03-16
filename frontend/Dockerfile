FROM node:20-slim

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

# build the app
RUN pnpm build

# expose the port the app runs on
EXPOSE 5173

# command to run the app
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"] 