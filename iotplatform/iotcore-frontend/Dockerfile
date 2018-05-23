FROM node:9

# add entrypoint script
COPY start.sh /
COPY index.js /
COPY package.json /
RUN chmod u+x /start.sh
RUN chmod u+x /index.js
RUN chmod u+x /package.json

RUN mkdir /protos
COPY ./protos/helloworld.proto /protos/

EXPOSE 8080 50051

ENTRYPOINT /start.sh
