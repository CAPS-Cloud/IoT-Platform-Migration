#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh activemq:1883 --timeout=0 --strict
/wait-for-it.sh zookeeper:2181 --timeout=0 --strict
/wait-for-it.sh kafka:9094 --timeout=0 --strict

npm start

# don't exit
/usr/bin/tail -f /dev/null
