FROM node:18-alpine


ENV PORT 3000

WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/


RUN npm install

# Copying source files
COPY . /usr/src/app

ENV RUNTIME_ENV=development

# Running the app
CMD npm run dev
