#!/bin/bash

./wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
./wait-for-it.sh $KAFKA --timeout=0 --strict

$GOPATH/bin/http-gateway-go --zookeeper $ZOOKEEPER --port 8084

# don't exit
/usr/bin/tail -f /dev/null
