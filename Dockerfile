FROM klakegg/hugo:ext-alpine

RUN apk add --update nodejs npm

RUN npm install postcss-cli postcss -g
