FROM node:20-slim

# this is where our app code will live
WORKDIR /app

# copy package files first for better caching
COPY package.json package-lock.json ./

# install dependencies
RUN npm ci

# yo we need these types for the build
RUN npm install --save-dev @types/node

# copy the rest of the app
COPY . .

# yo make sure we use the right env file
RUN cp .env.production .env

# build the app
RUN npm run build

# expose the port the app runs on
EXPOSE 5173

# command to run the app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 