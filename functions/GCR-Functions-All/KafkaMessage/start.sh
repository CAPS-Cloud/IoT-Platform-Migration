#!/bin/bash

# /wait-for-it.sh iot-zookeeper:2181 --timeout=0 --strict
# /wait-for-it.sh iot-kafka:9092--timeout=0 --strict

cd /app

npm run start 

# don't exit
/usr/bin/tail -f /dev/null
