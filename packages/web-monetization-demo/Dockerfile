FROM node:lts as build
WORKDIR /usr/src/app

#COPY package.json package-lock.json ./
COPY . ./

RUN npm install && \
    rm -rf node_modules && \
    npm install --production

FROM node:lts-slim
WORKDIR /usr/src/app

COPY --from=build /usr/src/app /usr/src/app

EXPOSE 3000
CMD node build/server/main.js
