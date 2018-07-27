#!/bin/bash

/wait-for-it.sh $IOTCORE_BACKEND --timeout=0 --strict

cd app

npm start

# don't exit
/usr/bin/tail -f /dev/null
