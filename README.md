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
| Name                | IP             | CPU | VCPU | Ram | Storage |
| ------------------- | -------------- | --- | ---- | --- | ------- |
| Kubernetes_Master   | 141.40.254.145 | 1   | 2    | 4GB | 50GB    |
| Kubernetes_Worker_1 | Temporary closed | 1   | 1    | 8GB | 50GB    |
| Kubernetes_Worker_2 | 141.40.254.146 | 1   | 1    | 8GB | 50GB    |
### Accessing
You can use any ssh client to access the VM using username of root and certificate file infrastructure/SSH.ppk in this repository

## Kubernetes
### Accessing
#### Using kubectl
1. Follows this guide to install kubectl on your machine. https://kubernetes.io/docs/tasks/tools/install-kubectl/
2. Copy .kube folder from /infrastructure in this repository to your user's home directory.
3. You can now use kubectl refering to this reference. https://kubernetes.io/docs/reference/kubectl/overview/
#### Using dashboard
1. Go to https://kube-dashboard.iot.pcxd.me:30443
2. Select "Token".
3. Enter this token into the text field. `eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWt6N3M3Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJkMzViMjRiMS02NWYzLTExZTgtYTJlYi0wMjAxMDBmODAwMjkiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.l9U5z4wcWXBMIYMLH6TJL0FQj4YyfIjQBmFcM7TVWMhiM56PFRrHuxLZ0F-CZ-mSP2O3tAllXsLiy9j6Hsz1Q0DspPbiLv7CZT7l_5RAQ0F3VqVvY3anxX7hx6LgoLiamF9y5Y000wBaZLnpVBZozMp9VVm8UzflhdvQT1L6FI27P9p0SnJ-SZ4D9m_96KOdGGLVc5wNVETjTpugpbC-lqtwD94NTNvyEfkMQfK-_VJaQiGbZN-qSYhh7I1CFkBBaREQgAjubX4aPaox8sMTZtsh5bOzK_HjxwTqua_O25SGfg1q3soB20glGKTuNmA9OnlYMRLmPv50D1IIUHq3Fw`
4. Click "SIGN IN".
5. You are now in the dashboard. Here is some brief introduction about the dashboard. https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#welcome-view
### Setting up
#### Preparing the host
TODO
#### Adding nodes
1. Run `kubeadm token create` on the master node (token will be expired after 24 hours).
2. Run `kubeadm join 141.40.254.145:6443 --token <token from step 1> --discovery-token-ca-cert-hash sha256:1e6253959bd1f6b1b77efee5162083981d889abadb674eb89a62c6a229608178` on the node you want to add.
