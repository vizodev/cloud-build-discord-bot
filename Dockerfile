FROM node:lts-alpine as prod
WORKDIR /app

COPY package*.json ./
RUN npm install --ci
COPY . .


ENV PORT=3333
EXPOSE ${PORT}
ENV NODE_ENV production
ENV USE_DEFAULT_SERVICE_ACCOUNT true


RUN npm run build-tsoa

RUN npm run build:backend

CMD ["node", "./dist/src/main.js"]