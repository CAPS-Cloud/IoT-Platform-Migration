#!/bin/sh

cd /flink/flink-1.4.2

java -version

/wait-for-it.sh $ELASTICSEARCH:9300 --timeout=0 --strict
/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict

./bin/start-local.sh

# don't exit
/usr/bin/tail -f /dev/null
