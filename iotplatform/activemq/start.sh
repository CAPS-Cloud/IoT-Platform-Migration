#!/bin/bash

cd apache-activemq-5.14.1/bin
./activemq start

# don't exit
/usr/bin/tail -f /dev/null

