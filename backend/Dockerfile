FROM ghcr.io/puppeteer/puppeteer:25.11.0

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

CMD ["node", "src/index.js"]
