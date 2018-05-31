#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh $ACTIVEMQ_MQTT --timeout=0 --strict 

npm run start -- $ACTIVEMQ_MQTT

# don't exit
/usr/bin/tail -f /dev/null
