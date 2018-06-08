#!/bin/bash

redis-server

# don't exit
/usr/bin/tail -f /dev/null
