FROM node:6

COPY index.js .
COPY package.json .
RUN npm install --production
CMD ["node", "index.js"]
