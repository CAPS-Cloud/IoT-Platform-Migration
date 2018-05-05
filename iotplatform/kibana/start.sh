#!/bin/sh

cd /kibana/kibana-4.1.3-linux-x64

/wait-for-it.sh elasticsearch:9200 --timeout=0 --strict -- echo "elasticsearch is up"

./bin/kibana

# don't exit
/usr/bin/tail -f /dev/null
