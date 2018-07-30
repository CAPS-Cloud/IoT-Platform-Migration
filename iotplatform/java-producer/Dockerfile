FROM maven:3.5.2-jdk-8-alpine

RUN apk update \
 && apk add jq \
 && apk add bash \
 && apk add curl \
 && rm -rf /var/cache/apk/*

WORKDIR /app
COPY pom.xml /app
RUN mvn install
COPY app /app
RUN mvn package

COPY prepare-integration-test.sh /
RUN chmod a+x /prepare-integration-test.sh

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
