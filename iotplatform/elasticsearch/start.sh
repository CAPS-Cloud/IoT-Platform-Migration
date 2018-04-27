#!/bin/sh

cd /elasticsearch/elasticsearch-1.7.3

./bin/elasticsearch

# don't exit
/usr/bin/tail -f /dev/null
