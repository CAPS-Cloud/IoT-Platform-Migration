#!/bin/sh

ls

cd /opt/Kafka/kafka_2.11-1.1.0/

./bin/zookeeper-server-start.sh ./config/zookeeper.properties &
sleep 2

./bin/kafka-server-start.sh ./config/server.properties &
sleep 2

./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic livedata

./bin/kafka-topics.sh --list --zookeeper localhost:2181

# don't exit
/usr/bin/tail -f /dev/null
