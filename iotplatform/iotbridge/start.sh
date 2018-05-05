#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh activemq:1883 --timeout=0 --strict -- echo "activemq is up"
/wait-for-it.sh kafka:2181 --timeout=0 --strict -- echo "kafka is up"

npm start

# don't exit
/usr/bin/tail -f /dev/null
