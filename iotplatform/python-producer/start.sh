#!/bin/sh

/wait-for-it.sh $WS_GATEWAY --timeout=0 --strict

python main.py $WS_GATEWAY

# don't exit
/usr/bin/tail -f /dev/null
