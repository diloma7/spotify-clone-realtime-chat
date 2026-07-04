FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

RUN mkdir -p temp && chown -R node:node /usr/src/app

ENV NODE_ENV=production

USER node

EXPOSE 5006

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||5006,path:'/health'},(res)=>process.exit(res.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/server.js"]
