FROM maven:3.5.2-jdk-8

VOLUME /usr/share/maven/ref/repository
VOLUME /root/.m2

# install kafka
RUN mkdir /flink \
  && wget http://apache.lauf-forum.at/flink/flink-1.4.2/flink-1.4.2-bin-hadoop28-scala_2.11.tgz \
  && tar -xzf /flink-1.4.2-bin-hadoop28-scala_2.11.tgz -C /flink/

RUN mkdir /proj

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

EXPOSE 8081

ENTRYPOINT /start.sh
