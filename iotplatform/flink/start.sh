#!/bin/sh

cd /docker/flink/flink-1.3.2

./bin/start-local.sh

./bin/flink run -c de.tu.dresden.TestStreamConsumer /docker/proj/target/kpstreambench-flink-1.0-SNAPSHOT.jar

# don't exit
/usr/bin/tail -f /dev/null
