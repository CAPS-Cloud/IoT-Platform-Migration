#!/bin/sh

cd /opt/activemq/bin/

./activemq start

# don't exit
/usr/bin/tail -f /dev/null
