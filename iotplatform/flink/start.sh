#!/bin/sh

cd /flink/flink-1.4.2

java -version

./bin/start-local.sh

/wait-for-it.sh elasticsearch:9200 --timeout=0 --strict
/wait-for-it.sh zookeeper:2181 --timeout=0 --strict
/wait-for-it.sh kafka:9094 --timeout=0 --strict

curl -XPOST "http://elasticsearch:9200/livedata" -d '{
  "mappings": {
    "sensorReading": {
      "properties": {
        "date": {
          "type": "date"
        },
        "sensorId": {
          "type": "text"
        },
        "sensorGroup": {
          "type": "text"
        },
        "reading": {
          "type": "float"
        }
      }
    }
  }
}'

sleep 2

curl -XGET "http://elasticsearch:9200/_cat/indices?v&pretty"

./bin/flink run /proj/target/flink-kafka-1.0.jar --topic livedata --bootstrap.servers kafka:9094 --zookeeper.connect zookeeper:2181 --groud.id mygroup

# don't exit
/usr/bin/tail -f /dev/null
