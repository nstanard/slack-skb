FROM node:14.16.0 as react-build
workdir /app
COPY ./package.json ./
RUN npm run build
