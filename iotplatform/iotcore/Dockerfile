FROM node:9

RUN apt-get update -qq \
    && apt-get install -y libzmq3 libzmq3-dev build-essential make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Java.
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  apt-get update && \
  apt-get install -y software-properties-common && \
  add-apt-repository "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" && \
  apt-get update && \
  apt-get install -y oracle-java8-installer && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

# Define commonly used JAVA_HOME variable
RUN update-alternatives --config java
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

COPY app /app/

COPY web/index.html /app/public/index.html
COPY web/dist /app/public/static

RUN chmod -R a+x /app \
    && cd /app \
    && npm install --no-optional --save \
    && cd ../

COPY wait-for-it.sh /
RUN chmod a+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 3000

ENTRYPOINT /start.sh
