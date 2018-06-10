#!/bin/sh

cd /flink/flink-1.4.2

java -version

./bin/start-local.sh

/wait-for-it.sh $ELASTICSEARCH:9200 --timeout=0 --strict
/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict

curl -XPOST "http://$ELASTICSEARCH:9200/livedata" -d '{
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

curl -XGET "http://$ELASTICSEARCH:9200/_cat/indices?v&pretty"

./bin/flink run /proj/target/flink-kafka-1.0.jar --elasticsearch $ELASTICSEARCH --topic livedata --bootstrap.servers $KAFKA --zookeeper.connect $ZOOKEEPER --groud.id mygroup

# don't exit
/usr/bin/tail -f /dev/null
