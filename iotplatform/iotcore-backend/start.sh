#!/bin/bash

/wait-for-it.sh $MARIADB --timeout=0 --strict
/wait-for-it.sh $KAFKA --timeout=0 --strict
/wait-for-it.sh $ZOOKEEPER --timeout=0 --strict
/wait-for-it.sh $ELASTICSEARCH --timeout=0 --strict
/wait-for-it.sh $FLINK --timeout=0 --strict

cd app

npm run start -- $MARIADB

# don't exit
/usr/bin/tail -f /dev/null
