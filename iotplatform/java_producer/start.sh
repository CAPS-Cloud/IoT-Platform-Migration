#!/bin/sh

/wait-for-it.sh iotbridge:8083 --timeout=0 --strict 

java -version

java -jar target/java_producer-1.0.jar http://iotbridge:8083

# don't exit
/usr/bin/tail -f /dev/null
