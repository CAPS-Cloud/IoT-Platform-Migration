#!/bin/bash

/wait-for-it.sh $MQTT_GATEWAY --timeout=0 --strict

cd app

npm run start -- $MQTT_GATEWAY

# don't exit
/usr/bin/tail -f /dev/null
