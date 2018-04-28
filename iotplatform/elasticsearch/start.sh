#!/bin/sh

cd /elasticsearch/elasticsearch-5.6.3

java -version

./bin/elasticsearch

# don't exit
/usr/bin/tail -f /dev/null
