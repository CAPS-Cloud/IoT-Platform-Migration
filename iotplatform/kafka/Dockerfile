FROM ubuntu:16.04

# install java
RUN apt-get update
RUN apt-get install -y openjdk-8-jre

# add entrypoint script
COPY start.sh /
RUN chmod u+x /start.sh

# install kafka
ADD http://mirrors.ae-online.de/apache/kafka/0.10.0.1/kafka_2.11-0.10.0.1.tgz /kafka.tgz
RUN tar -xzf /kafka.tgz && mv /kafka_2.11-0.10.0.1 /kafka

# expose kafka port
EXPOSE 2181

ENTRYPOINT /start.sh

