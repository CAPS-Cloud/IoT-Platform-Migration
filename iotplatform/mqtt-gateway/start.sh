#!/bin/bash

/wait-for-it.sh $REDIS --timeout=0 --strict
/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict

cd /app

npm run start -- $ZOOKEEPER $IOTCORE_BACKEND $REDIS

# don't exit
/usr/bin/tail -f /dev/null
