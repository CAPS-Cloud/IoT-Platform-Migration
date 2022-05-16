#!/bin/bash

cd ../../
# start tiller pod using helm init
helm init

# wait for tiller pod to start
sleep 15

# wait for tiller pod to start
helm upgrade --debug --wait --install --force --recreate-pods --values ./iotplatform/docker-compose.yml --set-string defaults.imageTag=new-deployment-wo-https-updated iot ./iotplatform/helm-chart/iot