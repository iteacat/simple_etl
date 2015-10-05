FROM node:4.1.1
COPY package.json /build/package.json
RUN cd /build && \
    npm install
COPY . /build

ENV NODE_ENV=prod NODE_PATH=/build
CMD ["node", "--stack-size=2000000", "/build/main/index"]
