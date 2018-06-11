FROM redis

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

ENTRYPOINT /start.sh
