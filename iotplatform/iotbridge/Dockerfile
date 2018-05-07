FROM node:9

COPY index.js /
COPY package.json /
RUN chmod u+x /index.js
RUN chmod u+x /package.json

RUN mkdir /protos
COPY ./protos/helloworld.proto /protos/

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
