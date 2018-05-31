#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh $ACTIVEMQ_MQTT --timeout=0 --strict
/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict

npm run start -- $ZOOKEEPER $IOTCORE_BACKEND $ACTIVEMQ_MQTT

# don't exit
/usr/bin/tail -f /dev/null
