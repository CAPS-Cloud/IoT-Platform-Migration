#!/bin/sh

cd /flink/flink-1.4.2

java -version

./bin/start-local.sh

/wait-for-it.sh elasticsearch:9200 --timeout=30 --strict -- echo "elasticsearch is up"

curl -XPUT "http://elasticsearch:9200/livedata"

curl -XGET "http://elasticsearch:9200/_cat/indices?v&pretty"

sleep 2

./bin/flink run /proj/target/flink-kafka-1.0.jar --topic livedata --bootstrap.servers kafka:9092 --zookeeper.connect kafka:2181 --groud.id mygroup

# don't exit
/usr/bin/tail -f /dev/null
