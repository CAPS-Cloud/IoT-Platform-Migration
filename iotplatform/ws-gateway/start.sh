#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict

npm run start -- $ZOOKEEPER $IOTCORE_BACKEND

# don't exit
/usr/bin/tail -f /dev/null
