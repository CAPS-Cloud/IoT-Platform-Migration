FROM openjdk:8-jre

RUN mkdir /elasticsearch \
  && wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.9.tar.gz \
  && tar -xzf /elasticsearch-5.6.9.tar.gz -C /elasticsearch/

# add entrypoint script
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 9200
EXPOSE 9300

RUN groupadd -r elastic && useradd --no-log-init -r -g elastic elastic \
  && chown -R elastic:elastic /elasticsearch/
USER elastic

ENTRYPOINT /start.sh
