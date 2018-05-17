#!/bin/bash
set -e

docker login --username ${DOCKERHUB_USER} --password $DOCKERHUB_PW

cd ${BUILD_PATH}

docker pull ${DOCKERHUB_USER}/${IMAGE_NAME}

docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:$TRAVIS_COMMIT ./ --cache-from ${DOCKERHUB_USER}/${IMAGE_NAME}

docker push ${DOCKERHUB_USER}/${IMAGE_NAME}
