#!/bin/bash

/wait-for-it.sh $MARIADB --timeout=0 --strict

cd app

npm run start -- $MARIADB

# don't exit
/usr/bin/tail -f /dev/null
