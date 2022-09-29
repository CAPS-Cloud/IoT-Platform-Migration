FROM node:latest

RUN mkdir /app
COPY app/package.json /app/package.json
COPY app/package-lock.json /app/package-lock.json


RUN cd /app \
    && npm install --no-optional --save \
    && cd ../

COPY app /app/

USER root
COPY start.sh /

EXPOSE 8049

RUN chmod a+x /start.sh

ENTRYPOINT /start.sh