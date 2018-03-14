FROM node:6

WORKDIR /root
COPY index.js package.json package-lock.json ./
COPY lib ./lib
RUN npm install --production
CMD ["node", "index.js"]
