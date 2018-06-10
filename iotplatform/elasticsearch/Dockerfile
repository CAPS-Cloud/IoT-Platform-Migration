FROM openjdk:8-jre

RUN mkdir /elasticsearch \
  && wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.3.tar.gz \
  && tar -xzf /elasticsearch-5.6.3.tar.gz -C /elasticsearch/

# add entrypoint script
COPY start.sh /
RUN chmod a+x /start.sh

COPY elasticsearch.yml /
RUN mv elasticsearch.yml /elasticsearch/elasticsearch-5.6.3/config/elasticsearch.yml

EXPOSE 9200 9300

RUN sudo sysctl -w vm.max_map_count=262144

RUN groupadd -r elastic && useradd --no-log-init -r -g elastic elastic \
  && chown -R elastic:elastic /elasticsearch/
USER elastic

ENTRYPOINT /start.sh
