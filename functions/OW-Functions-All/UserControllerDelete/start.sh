#!/bin/bash

cd app
npm run start

# don't exit
/usr/bin/tail -f /dev/null
