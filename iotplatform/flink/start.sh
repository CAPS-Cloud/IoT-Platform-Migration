#!/bin/sh

cd /flink/flink-1.4.2

./bin/start-local.sh

# don't exit
/usr/bin/tail -f /dev/null
