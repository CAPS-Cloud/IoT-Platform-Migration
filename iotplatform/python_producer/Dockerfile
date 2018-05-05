FROM python

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
