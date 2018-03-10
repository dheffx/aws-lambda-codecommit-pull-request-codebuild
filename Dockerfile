FROM node:6

RUN mkdir /opt/app
WORKDIR /opt/app
COPY package.tar.gz .
RUN tar -xzf package.tar.gz
CMD ["node", "index.js"]
