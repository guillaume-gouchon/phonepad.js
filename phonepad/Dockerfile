FROM node:10.15.3-jessie-slim

COPY . /usr/src
WORKDIR /usr/src

RUN npm install
RUN npm run build

CMD ["node", "."]

EXPOSE 8080
