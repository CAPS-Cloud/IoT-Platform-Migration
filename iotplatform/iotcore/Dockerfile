FROM node:14.0.0

RUN apt-get update -qq \
    && apt-get install -y libzmq3-dev build-essential make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Java.
RUN apt-get update && \
    apt-get install -y openjdk-8-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/ && \
    rm -rf /var/cache/oracle-jdk8-installer;

# Define commonly used JAVA_HOME variable
RUN update-alternatives --config java
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

# # SPARK
# ENV SPARK_VERSION 2.4.7
# ENV HADOOP_VERSION 2.7
# ENV SPARK_PACKAGE spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}
# ENV SPARK_HOME /usr/${SPARK_PACKAGE}
# ENV PATH $PATH:${SPARK_HOME}/bin

# RUN wget "http://mirror.synyx.de/apache/spark/spark-${SPARK_VERSION}/${SPARK_PACKAGE}.tgz" &&\ 
# 	tar -xzf /$SPARK_PACKAGE.tgz -C /usr/


RUN mkdir /app

COPY web /app/web_tmp/

RUN mkdir -p /app/public/static/ 

RUN cd /app/web_tmp && npm install --no-optional && \
	npm rebuild node-sass --force && \
	npm run build && \
	cp -a /app/web_tmp/dist/. /app/public/static/ && \
	rm -rf /app/web_tmp/


COPY web/index.html /app/public/index.html
#COPY web/dist /app/public/static

COPY app/package.json /app/package.json
COPY app/package-lock.json /app/package-lock.json

RUN cd /app \
    && npm install --no-optional --save \
    && cd ../
    
COPY app /app/

RUN chmod -R a+x /app 

COPY wait-for-it.sh /
RUN chmod a+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod a+x /start.sh

EXPOSE 3000

ENTRYPOINT /start.sh
