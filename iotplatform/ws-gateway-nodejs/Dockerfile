FROM node:alpine

RUN apk update \
 && apk add jq \
 && apk add bash \
 && rm -rf /var/cache/apk/*

COPY app /app/

RUN chmod -R a+x /app \
    && cd /app \
    && npm install --no-optional --save \
    && cd ../

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 8765

ENTRYPOINT /start.sh
