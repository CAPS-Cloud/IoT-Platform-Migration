#!/bin/bash
set -e

docker login --username ${DOCKERHUB_USER} --password $DOCKERHUB_PW

cd ${BUILD_PATH}

docker pull ${DOCKERHUB_USER}/${IMAGE_NAME}:latest || echo 'Tag latest not available - starting from scratch'

echo 'Quietly building '${DOCKERHUB_USER}/${IMAGE_NAME}

docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:$TRAVIS_COMMIT -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest ./ --cache-from ${DOCKERHUB_USER}/${IMAGE_NAME}:latest --quiet

docker push ${DOCKERHUB_USER}/${IMAGE_NAME}
