FROM openjdk:8-jre

WORKDIR /app
COPY pom.xml /app
RUN mvn install
COPY src /app
RUN mvn package

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
