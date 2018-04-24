FROM maven:3.5.2-jdk-8

VOLUME /usr/share/maven/ref/repository
VOLUME /root/.m2

ADD http://apache.lauf-forum.at/flink/flink-1.3.2/flink-1.3.2-bin-hadoop27-scala_2.10.tgz /flink.tgz
RUN mkdir /docker/flink
RUN mkdir /docker/proj
RUN tar -xzf /flink.tgz -C /docker/flink/

COPY /docker/flink/pom.xml /docker/proj/pom.xml
COPY /docker/flink/src /docker/proj/src

RUN cd /docker/proj
RUN mvn package

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

EXPOSE 8081

ENTRYPOINT /start.sh
