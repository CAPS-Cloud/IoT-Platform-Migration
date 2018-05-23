#!/bin/bash
set -e

contains() {
    if [[ $TRAVIS_TAG = *""* ]]
    then
      #"-live" is in $TRAVIS_TAG
      echo "true"
    else
      #"-live" is not in $TRAVIS_TAG
      echo "false"
    fi
}

echo "============== CHECKING IF DEPLOYMENT CONDITION IS MET =============="
echo $TRAVIS_TAG
export LIVE=$(contains)
echo $LIVE
