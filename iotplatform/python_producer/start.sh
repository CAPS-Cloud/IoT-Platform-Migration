#!/bin/sh

/wait-for-it.sh iotbridge:8765 --timeout=90 --strict -- echo "iotbridge wsserver is up"

python main.py

# don't exit
/usr/bin/tail -f /dev/null
