FROM node:20-alpine

COPY ["package.json", "/opt/client/"]
COPY ["package-lock.json", "/opt/client/"]

WORKDIR /opt/client

RUN npm ci

COPY ["src/", "/opt/client/src/"]
COPY ["src/setupProxy.js", "/opt/client/src/setupProxy.js"]
COPY ["public/", "/opt/client/public/"]
COPY ["tsconfig.json", "/opt/client/"]

CMD ["npm", "start"]
