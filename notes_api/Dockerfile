FROM node:lts As development

ARG DATABASE_URL
ARG JWT_SECRET
ARG EXPIRES_IN

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV EXPIRES_IN=${EXPIRES_IN}

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --only=development

COPY . .

RUN yarn run build

FROM node:lts as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG DATABASE_URL
ARG JWT_SECRET
ARG EXPIRES_IN

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV EXPIRES_IN=${EXPIRES_IN}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]