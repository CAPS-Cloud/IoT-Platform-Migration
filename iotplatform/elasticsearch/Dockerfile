FROM openjdk:8-jre

RUN mkdir /elasticsearch \
  && wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.3.tar.gz \
  && tar -xzf /elasticsearch-1.7.3.tar.gz -C /elasticsearch/

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

EXPOSE 9200

ENTRYPOINT /start.sh
