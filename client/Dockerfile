FROM node:20-alpine

COPY ["package.json", "/opt/client/"]
COPY ["package-lock.json", "/opt/client/"]

WORKDIR /opt/client

RUN npm ci

COPY ["src/", "/opt/client/src/"]
COPY ["public/", "/opt/client/public/"]
COPY ["index.html", "/opt/client/"]
COPY ["tsconfig.json", "/opt/client/"]
COPY ["vite.config.ts", "/opt/client/"]

CMD ["npm", "start"]
