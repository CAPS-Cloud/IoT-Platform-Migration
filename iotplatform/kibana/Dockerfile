FROM openjdk:8-jre

RUN mkdir /kibana \
  && wget https://download.elastic.co/kibana/kibana/kibana-4.1.3-linux-x64.tar.gz \
  && tar -xzf /kibana-4.1.3-linux-x64.tar.gz -C /kibana/

# add entrypoint script
USER root
COPY start.sh /
COPY wait-for-it.sh /
RUN chmod u+x /start.sh
RUN chmod u+x /wait-for-it.sh

EXPOSE 5601

ENTRYPOINT /start.sh
