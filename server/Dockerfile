# base image
FROM node:latest

RUN apt-get update && apt-get install -yq

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
CMD npm install

# add app
COPY . /app

CMD npm run build && npm run generate-secret && npm run serve