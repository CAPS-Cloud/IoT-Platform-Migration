#!/bin/bash
set -e

contains() {
    if [[ $TRAVIS_TAG = *"-live"* ]]
    then
      #"-live" is in $TRAVIS_TAG
      echo "true"
    else
      #"-live" is not in $TRAVIS_TAG
      echo "false"
    fi
}

echo "============== CHECKING IF DEPLOYMENT CONDITION IS MET =============="
export LIVE=$(contains)

echo $TRAVIS_TAG
echo $LIVE
