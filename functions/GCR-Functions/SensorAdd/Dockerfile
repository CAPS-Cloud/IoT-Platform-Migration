FROM node:14

RUN mkdir /app
COPY app/package.json /app/package.json



RUN cd /app \
    && npm install --no-optional --save \
    && cd ../

RUN apt-get update && apt-get install -y default-jre

COPY app /app/

USER root
COPY start.sh /

EXPOSE 8100

RUN chmod a+x /start.sh

ENTRYPOINT /start.sh