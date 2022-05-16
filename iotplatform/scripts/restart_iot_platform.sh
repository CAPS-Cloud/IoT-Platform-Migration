#!/bin/bash

helm delete --debug --purge iot

rm -r /u/iot_data/iotstorage/kafka/kafka-logs-1/meta.properties
# wait for pods to get deleted
#sleep 60
cd ../../
# start platform
helm upgrade --debug --wait --install --force --recreate-pods --values ./iotplatform/docker-compose.yml --set-string defaults.imageTag=new-deployment-wo-https-updated iot ./iotplatform/helm-chart/iot
