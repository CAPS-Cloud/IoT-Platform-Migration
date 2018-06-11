#!/bin/bash

cd app

npm start

# don't exit
/usr/bin/tail -f /dev/null
