FROM node:14.16.0
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 3000
CMD [ "node", "." ]
