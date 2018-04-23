#!/bin/bash

echo "advertised.host.name=kafka" >> /kafka/config/server.properties

# start kafka
/kafka/bin/zookeeper-server-start.sh /kafka/config/zookeeper.properties &
sleep 2
/kafka/bin/kafka-server-start.sh /kafka/config/server.properties &
sleep 2

# create topics
/kafka/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic live
/kafka/bin/kafka-topics.sh --list --zookeeper localhost:2181


# don't exit
/usr/bin/tail -f /dev/null

