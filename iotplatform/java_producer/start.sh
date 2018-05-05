#!/bin/sh

/wait-for-it.sh iotbridge:8083 --timeout=90 --strict -- echo "iotbridge http server is up"

java -version

# don't exit
/usr/bin/tail -f /dev/null
