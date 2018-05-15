#!/bin/bash
set -e

docker login --username $DOCKERHUB_USER --password $DOCKERHUB_PW

docker build -t ${DOCKERHUB_PROJECT}/${DOCKERHUB_REPOSITORY}:$TRAVIS_COMMIT -f ${BUILD_PATH} .

docker push ${DOCKERHUB_PROJECT}/${DOCKERHUB_REPOSITORY}
