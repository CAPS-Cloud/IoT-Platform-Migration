FROM golang

COPY app /app/

COPY wait-for-it.sh /
RUN chmod a+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 8083

ENTRYPOINT /start.sh
