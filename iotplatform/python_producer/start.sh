#!/bin/sh

/wait-for-it.sh iotbridge:8765 --timeout=0 --strict 

python main.py

# don't exit
/usr/bin/tail -f /dev/null
