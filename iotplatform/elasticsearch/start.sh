#!/bin/sh

cd /elasticsearch/elasticsearch-5.6.9

./bin/elasticsearch

# don't exit
/usr/bin/tail -f /dev/null
