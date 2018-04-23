FROM ubuntu:16.04

# install java
RUN apt-get update
RUN apt-get install -y openjdk-8-jre

# add entrypoint script
COPY start.sh /
RUN chmod u+x /start.sh

# install activemq
ADD http://www.apache.org/dyn/closer.cgi?filename=/activemq/5.14.1/apache-activemq-5.14.1-bin.tar.gz&action=download /activemq.tgz
RUN tar -xzf /activemq.tgz

# Expose all port
EXPOSE 61616

ENTRYPOINT /start.sh

