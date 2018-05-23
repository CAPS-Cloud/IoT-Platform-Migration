#!/bin/bash

npm install --no-optional --save

npm start

# don't exit
/usr/bin/tail -f /dev/null
