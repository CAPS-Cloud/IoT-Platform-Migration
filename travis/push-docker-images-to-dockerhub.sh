#!/bin/bash
set -e

docker login --username $DOCKERHUB_USER --password $DOCKERHUB_PW

docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:$TRAVIS_COMMIT -f ${BUILD_PATH} .

docker push ${DOCKERHUB_USER}/${IMAGE_NAME}
