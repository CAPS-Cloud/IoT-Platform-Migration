#!/bin/bash

npm install --no-optional --save

/wait-for-it.sh activemq:1883 --timeout=0 --strict 

npm start

# don't exit
/usr/bin/tail -f /dev/null
