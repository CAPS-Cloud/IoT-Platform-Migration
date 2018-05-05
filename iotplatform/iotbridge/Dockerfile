FROM node:9

# add entrypoint script
COPY start.sh /
COPY index.js /
COPY package.json /
RUN chmod u+x /start.sh
RUN chmod u+x /index.js
RUN chmod u+x /package.json

EXPOSE 8083
EXPOSE 8765

ENTRYPOINT /start.sh
