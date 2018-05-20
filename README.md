# iotplatform
[![Build Status](https://travis-ci.com/heldic/iotplatform.svg?token=UgRpWYHRU3yqYszd3B6x&branch=master)](https://travis-ci.com/heldic/iotplatform)

## Drive
- https://drive.google.com/drive/folders/1ggJi5N6ImurJ_Ztrwx-K3h0L1Do6GFN8?usp=sharing

## Messaging
### Overview
<img src="./doc/deviceModel.png" />

### Description
<tbd>

## Architecture
### Overview
<img src="./doc/iotplatform.png" />

### Components (Plan!)
#### IoTCore
- Metadata administration (CRUD-operations for devicemanagement)
- Create topics/indices/jobs within cluster components
- Check authorization of incoming requests
- Provide metadata information to gateways upon request, according to predefined schema

#### MQTT/HTTP/WS Gateway
- Cloud gateways enabling data ingestion
- Different protocols are supported by different gateways (depending on load, respective gateways can be scaled)
- Gateways enrich incoming sensordata with respective device information
- Data is forwarded to Kafka, topic is received from IoTCore

#### AccessController
- API that acts as buffer between consumer and Elasticsearch
- Check with IoTCore whether user is authorized to receive requested information

#### Kafka/Zookeeper
- Big data stream (collecting data from all gateways, no matter the protocol)
- Act as single point of information for processing layer

#### Flink
- Offer possibilities to add batch processing or analytical jobs
- Consume Kafka topics provided by IoTCore and forward data to Elasticsearch

#### Elasticsearch
- Persistence

#### Grafana
- Monitoring opportunity for Elasticsearch (Dev Ops)

#### Java/Node.js/Python Producer
- Sample producers to simulate the supported protocols
- Constructed scalable to simulate high loads on cluster

#### GenericConsumer
- Sample consumer that accesses various APIs
- Should also be scalable 

## Virtual Machines
| Name              | IP            | CPU | VCPU | Ram | Storage |
| ----------------- | ------------- | --- | ---- | --- | ------- |
| Kubernetes_Master | 10.155.208.89 | 1   | 2    | 4GB | 50GB    |
### Accessing
You can use any ssh client to access the VM using username of root and certificate file infrastructure/SSH.ppk in this repository

## Kubernetes
### Accessing
#### Using kubectl
1. Follows this guide to install kubectl on your machine. https://kubernetes.io/docs/tasks/tools/install-kubectl/
2. Copy .kube folder from /infrastructure in this repository to your user's home directory.
3. You can now use kubectl refering to this reference. https://kubernetes.io/docs/reference/kubectl/overview/
#### Using dashboard
1. Go to https://10.155.208.89:30443/
2. Select "Token".
3. Enter this token into the text field. `eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWttd200Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJhMjI1MjU1Ni01YjQ4LTExZTgtYTFiNi0wMjAwMDBmODAwMjgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.i7jwRyawC8syGea4LC5B0-g8mjg4RrtoQjwPNRsAAgQ1QYhO2D8KvaIMhMpVQkDcl9yC6sZp4KCu-JM5diZogmdSUattPxC_vnEDKqVkGtsFKbPPtuH6isMNT2yqz4SlH_HJemM_-ocql_vZuj1NjoFsyDVMsMF3LRXsu7TZhs-DwAGS84oD6R6vYdT-3ip6fqLHDRMuuIETBx3P_TxBocqK9q29Dxur4pvGZ5CNVWz18VdDNi9oDGtFLFfo8lLGXM9aibaVfctUtU6KllC0qvSpAs7_b5xiCKimOcelhh4B4GdTCf2mbU95pgqB3nEHaVWsoTiaztxkSQmZ5FBvMQ`
4. Click "SIGN IN".
5. You are now in the dashboard. Here is some brief introduction about the dashboard. https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#welcome-view
