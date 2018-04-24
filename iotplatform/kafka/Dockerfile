FROM openjdk:8-jre

# install kafka
RUN mkdir /opt/Kafka \
  && wget http://mirror.dkd.de/apache/kafka/1.1.0/kafka_2.11-1.1.0.tgz \
  && tar -xzf /kafka_2.11-1.1.0.tgz -C /opt/Kafka/

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

# expose kafka port
EXPOSE 9092
EXPOSE 2181

ENTRYPOINT /start.sh
