#!/bin/bash

/wait-for-it.sh $MQTT_GATEWAY --timeout=0 --strict
/wait-for-it.sh $IOTCORE_BACKEND --timeout=0 --strict

sleep 10

source /prepare-integration-test.sh

sleep 10

cd app

npm run start -- $MQTT_GATEWAY $IOTCORE_BACKEND $DEVICE_ID $SENSOR_ID $TOKEN

# don't exit
/usr/bin/tail -f /dev/null
