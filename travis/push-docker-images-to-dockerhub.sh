#!/bin/bash
set -e

docker login --username ${DOCKERHUB_USER} --password $DOCKERHUB_PW

cd ${BUILD_PATH}

docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:$TRAVIS_COMMIT ./

docker push ${DOCKERHUB_USER}/${IMAGE_NAME}
