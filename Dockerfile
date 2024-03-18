FROM node:lts-bookworm-slim

WORKDIR /usr/src/app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm i
COPY . .

ENV PORT=$port
EXPOSE $PORT

# Command to run your app
CMD ["npm", "run", "deploy"]