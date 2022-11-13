FROM node:16-slim

WORKDIR /usr/src/app

COPY ./ ./

RUN npm ci

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD [ "npm", "run", "start" ]
