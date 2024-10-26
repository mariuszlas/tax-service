FROM node:20

WORKDIR /app

COPY package*.json ./

# Install production dependencies and clean the cache
RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:prod" ]