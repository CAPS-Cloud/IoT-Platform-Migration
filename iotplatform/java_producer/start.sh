#!/bin/sh

java -version

java -jar target/java_producer-1.0.jar http://iotbridge:8083

# don't exit
/usr/bin/tail -f /dev/null
