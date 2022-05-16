#!/bin/bash
# build flink jars
cd ..
cd flink_jars/PersistOnly
mvn clean package -Pbuild-jar
cp flink-kafka-1.0.jar ../../../iotcore/app/flink_jars/
cd ../AlertNotification/src
mvn clean package -Pbuild-jar
cp alert-notification-1.0 ../../../iotcore/app/flink_jars/
cd ../../../

# run docker compose

docker-compose build

# push images to gitlab
docker-compose push
