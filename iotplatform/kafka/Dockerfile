FROM openjdk:8-jre

# install kafka
ADD http://mirror.dkd.de/apache/kafka/1.1.0/kafka_2.11-1.1.0.tgz /kafka.tgz
RUN mkdir /opt/Kafka
RUN tar -xzf /kafka.tgz -C /opt/Kafka/

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

# expose kafka port
EXPOSE 9092
EXPOSE 2181

ENTRYPOINT /start.sh
