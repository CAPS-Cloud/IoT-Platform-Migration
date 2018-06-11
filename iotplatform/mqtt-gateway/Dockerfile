FROM node:9

RUN apt-get update -qq \
    && apt-get install -y libzmq3 libzmq3-dev build-essential make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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

ENTRYPOINT /start.sh
