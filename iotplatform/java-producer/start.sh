#!/bin/sh

/wait-for-it.sh $HTTP_GATEWAY --timeout=0 --strict

java -version

java -jar target/java_producer-1.0.jar http://$HTTP_GATEWAY

# don't exit
/usr/bin/tail -f /dev/null
