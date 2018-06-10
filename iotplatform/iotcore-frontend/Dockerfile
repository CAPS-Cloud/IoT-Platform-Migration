FROM node:9

COPY app /app/

RUN chmod -R a+x /app \
    && cd /app \
    && npm install --no-optional --save \
    && cd ../

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 8080

ENTRYPOINT /start.sh
