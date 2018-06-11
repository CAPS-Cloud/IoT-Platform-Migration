FROM maven:3.5.2-jdk-8

RUN mkdir /flink \
  && wget http://apache.lauf-forum.at/flink/flink-1.4.2/flink-1.4.2-bin-hadoop28-scala_2.11.tgz \
  && tar -xzf /flink-1.4.2-bin-hadoop28-scala_2.11.tgz -C /flink/

RUN mkdir /proj
RUN mkdir -p /proj/src/main/java
COPY ReadFromKafka.java /proj/src/main/java/
COPY SensorReading.java /proj/src/main/java/
COPY pom.xml /proj/

RUN cd /proj \
  && mvn --version \
  && mvn package

COPY wait-for-it.sh /
RUN chmod a+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 8081

ENTRYPOINT /start.sh
