# iotplatform - [![Build Status](https://travis-ci.com/heldic/iotplatform.svg?token=UgRpWYHRU3yqYszd3B6x&branch=master)](https://travis-ci.com/heldic/iotplatform)

_Peeranut Chindanonda, Helge Dickel, Christoph Gebendorfer, Bahareh Hosseini, Hans Kirchner_



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Content

- [TL;DR](https://github.com/heldic/iotplatform#tldr)
- [Architecture](https://github.com/heldic/iotplatform#architecture)
- [Deployment](https://github.com/heldic/iotplatform#deployment)
- [Components](https://github.com/heldic/iotplatform#components)
    - [IoTCore](https://github.com/heldic/iotplatform#iotcore)
        - [API](https://github.com/heldic/iotplatform#api)
        - [Creating Devices and Sensors using the GUI](https://github.com/heldic/iotplatform#creating-devices-and-sensors-using-the-gui)
        - [Creating Devices and Sensors using the API](https://github.com/heldic/iotplatform#creating-devices-and-sensors-using-the-api)
        - [Retrieving Data](https://github.com/heldic/iotplatform#retrieving-data)
    - [Gateways](https://github.com/heldic/iotplatform#gateways)
        - [HTTP Gateway](https://github.com/heldic/iotplatform#http-gateway)
        - [WS Gateway](https://github.com/heldic/iotplatform#ws-gateway)
        - [MQTT Gateway](https://github.com/heldic/iotplatform#mqtt-gateway)
    - [Kafka/Zookeeper](https://github.com/heldic/iotplatform#kafkazookeeper)
    - [Flink](https://github.com/heldic/iotplatform#flink)
    - [Elasticsearch](https://github.com/heldic/iotplatform#elasticsearch)
    - [Kibana](https://github.com/heldic/iotplatform#kibana)
    - [Java/Node.js/Python Producer](https://github.com/heldic/iotplatform#javanodejspython-producer)
- [Data Model](https://github.com/heldic/iotplatform#data-model)
    - [Device/Sensor Data Model](https://github.com/heldic/iotplatform#devicesensor-data-model)
    - [Data Model](https://github.com/heldic/iotplatform#data-model)
    - [Data Model Example](https://github.com/heldic/iotplatform#data-model-example)
- [Security Concept](https://github.com/heldic/iotplatform#security-concept)
    - [Retrieving JWT Tokens](https://github.com/heldic/iotplatform#retrieving-jwt-tokens)
    - [Pushing Data](https://github.com/heldic/iotplatform#pushing-data)
- [Gateway Benchmarks](https://github.com/heldic/iotplatform#gateway-benchmarks)
    - [HTTP Gateways](https://github.com/heldic/iotplatform#http-gateways)
    - [WS Gateways](https://github.com/heldic/iotplatform#ws-gateways)
- [Virtual Machines](https://github.com/heldic/iotplatform#virtual-machines)
    - [Access](https://github.com/heldic/iotplatform#access)
- [Kubernetes](https://github.com/heldic/iotplatform#kubernetes)
    - [Accessing the Cluster](https://github.com/heldic/iotplatform#accessing-the-cluster)
        - [Using `kubectl`](https://github.com/heldic/iotplatform#using-kubectl)
        - [Using K8s Dashboard](https://github.com/heldic/iotplatform#using-k8s-dashboard)
    - [Setting up the Cluster](https://github.com/heldic/iotplatform#setting-up-the-cluster)
        - [Preparing the Host](https://github.com/heldic/iotplatform#preparing-the-host)
        - [Adding Nodes](https://github.com/heldic/iotplatform#adding-nodes)
- [Outlook](https://github.com/heldic/iotplatform#outlook)



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## TL;DR
This repository contains all you need to set up an IoT infrastructure that features
secure communication, scalability, platform independence, HTTP/WS/MQTT protocol support,
device/sensor administration, persistence and analytical extensibility.
Ensure Docker is installed and run:
```bash
#!/bin/bash
git clone https://github.com/heldic/iotplatform.git

cd iotplatform/iotplatform

docker-compose up
```



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Architecture
The full composition of the pipeline of iotplatform:

<img src="./doc/diagrams/iotplatform_pipeline.png" />



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Deployment
Development is done via docker-compose to enable working locally, since
cluster-resources are limited:

<img src="./doc/diagrams/deployment.png" />



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Components
### IoTCore
- Metadata administration (CRUD-operations for device and sensor management)
- Automatically creates Kafka topics, Elasticsearch indices & Flink jobs within
corresponding pods in the cluster upon device/sensor creation
- Generate JWTs and Consumer Secrets
- Check authorization of incoming requests
- Serve as authentication proxy for Elasticsearch, forwarded verified queries


[//]: <########################################################################>
#### Creating Devices and Sensors using the GUI
In order to create a device and sensor follow these steps:
1. Go to `http://<HOST>:8080/devices`
2. Login using the following credentials:
    - user: `root`
    - passowrd: `x5KATOHT9zHczR49aPy0`
3. Click _add device_
4. Enter the desired device details
5. Click _add_
6. Look for your device and click _view_ to enter it's corresponding detail page
7. Click _add sensor_
8. Enter the desired sensor details
9. Click _add_
10. Click _download device key_ and save the file. It obtains the token required for data ingestion via one of the protocols
11. Hover over the info icon next to the sensor and note the _sensor_id_
12. Turn towards one of the following chapters to connect your device to the platform.
    - [HTTP Gateway](https://github.com/heldic/iotplatform#http-gateway)
    - [WS Gateway](https://github.com/heldic/iotplatform#ws-gateway)
    - [MQTT Gateway](https://github.com/heldic/iotplatform#mqtt-gateway)


[//]: <########################################################################>
#### Creating Devices and Sensors using the API
Alternatively you can use the following sample functions to administer your devices using _curl_, or at least get a quick overview how you can automate device creation by issueing a couple of GET/POST-requests.

The following script creates a sample device (named: `${NAME}-device`) and sensor (named `${NAME}-sensor`) at the iotcore at `${IOTCORE_BACKEND}` and stores the _token_ and _device_id_ and _sensor_id_ to corresponding environment variables for further use.
```bash
#!/bin/bash
set -e

export NAME=<YOUR_DESIRED_NAME>

# Login to retrieve initial token
get_initial_token() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -d '{"username":"root","password":"x5KATOHT9zHczR49aPy0"}' \
            ${IOTCORE_BACKEND}/api/users/signin \
        > jwt.json

    export JWT=$(cat jwt.json \
        | jq -r '.token'
    )
}

# Create device by issueing POST request to IoTCore backend
create_device() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer "${JWT} \
            -d '{"name":"'${NAME}'-device","description":"'${NAME}'-integration-test-device"}' \
            ${IOTCORE_BACKEND}/api/devices/ \
        > device.json

    export DEVICE_ID=$(cat device.json \
        | jq -r '.result.id'
    )
}

# Create sensor by issueing POST request to IoTCore backend
create_sensor() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer "${JWT} \
            -d '{"name":"'${NAME}'-sensor","description":"'${NAME}'-integration-test-sensor","mapping":"{\"type\":\"double\"}"}' \
            ${IOTCORE_BACKEND}/api/devices/${DEVICE_ID}/sensors/ \
        > sensor.json

    export SENSOR_ID=$(cat sensor.json \
        | jq -r '.id'
    )
}

# Retrieve auth key for device from IoTCore backend
retrieve_auth_key() {
    curl \
            -X GET \
            -H "Authorization: Bearer "${JWT} \
            ${IOTCORE_BACKEND}/api/devices/${DEVICE_ID}/key \
        > token.json

    export TOKEN=$(cat token.json \
        | jq -r '.token'
    )
}


################################################################################
################################################################################
################################################################################

get_initial_token
create_device
create_sensor
retrieve_auth_key

```

[//]: <########################################################################>
#### API

<img src="./doc/diagrams/iotcore_api.png" />


[//]: <########################################################################>
#### Retrieving Data
Currently there are two ways to extract your data from the platform:

__Using Elasticsearch APIs:__</br>
1. Go to `http://<HOST>:8080/devices`
2. Login using the following credentials:
    - user: `root`
    - passowrd: `x5KATOHT9zHczR49aPy0`
3. Click _consumer_
4. Click _add consumer_
5. Enter consumer details
6. Click _add_
7. Click _view_ to access the consumer you have just added
8. Pick a sensor to grant that consumer and click _grant_
9. Click _download consumer key_ and keep this file for later
10. ... tbc

Using Kibana:</br>
Users can configure there own Kibana dashboards at `http://<HOST>:5601`.


[//]: <########################################################################>
### Gateways
- Data ingestion pods
- Currently three different protocols are supported (HTTP, WebSockets, MQTT)
- Incoming requests/connections are verified, the included JWT decoded and the
`device_id` obtained
- Messages are forwarded to Kafka, the respective topic is assembled: `<DEVICE_ID>_<SENSOR_ID>`
- In order to compare the performance of Go vs. Node.js within such usecases, the
WS and HTTP gateways are implemented in both languages

Gateways are available at:
- MQTT Gateway: `<HOST>:1883/` (Node.js)
- HTTP Gateway: `<HOST>:8084/` (Go)
- HTTP Gateway: `<HOST>:8083/` (Node.js)
- WS Gateway: `<HOST>:8765/` (Node.js)
- WS Gateway: `<HOST>:8766/` (Go)

Depending on the environment `<HOST>` has to be replaced by `http://iot.pcxd.me`, `http://localhost` or whereever you deploy iotplatform. Every gateway supports ingesting either single JSON objects
or an array of JSON objects of the following kind:
```json
{
    "sensor_id": "4",
    "timestamp": 1526717967,
    "value": "91827364"
}
```


[//]: <########################################################################>
#### HTTP Gateway
The HTTP gateway exposes a single endpoint that allows ingesting single or
multiple sensor values. Authorization is done via the `authorization` header.
The gateway decodes the token included here and uses the `device_id` contained
in the payload of the JWT's subject field (`sub`) to determine the Kafka topic.
The `Content-Type` header has to be set to `application/json` and the request
body must contain a JSON array (for multiple events) or a single JSON object.
The server responds with one of the following HTTP response codes:
- `200 OK`: On success, the format of the message was valid and the request authorized.
Message is forwarded to Kafka
- `401 Unauthorized`: The `authorization` header is missing or the header's value is inproperly
formatted
- `403 Forbidden`: JWT token could not be verified, is expired or invalid

Sample Request:
```bash
#!/bin/bash
curl \
    -X POST \
    -H "Content-Type: application/json" \
    -H "authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MzI4NzU3ODIsImlzcyI6ImlvdHBsYXRmb3JtIiwic3ViIjoiMyJ9.Rl8deAsB-VChSvYzaIrD7hf0NUhSaVZad_c9xaMjo8CoQRNTTBt0Pcss-4SrI2nNWIqIM_cHjMNbmojZKCM5MZWFTpFloLlu2x3-dqBWk5Cm4iYRuQqQ-ANKEqbTxIwwNIzgssHMs2s_Z6hzDNvZ6WVvlBHxgjy4avKGCdzN8dlg9UZZ7t2it5zQyIk4k6mi7gXEfaXZMX90OW8TYlolPAHi58b_duiSq8beM4azG6GilELUv123rVNENSranbwMjQz7xWqKGfAfSTWbNHr3cX0KK0PpjMXjAGQURSf_uPf_WJy3ynnbJTb4jfidNYvnVp3ZuydL8u9PJrAx85r-4ECd61F-koJuA3NEe4A67o5cg2bal_YjDr_VbFl4WizHIbLEP2jGfhFVjAoecivMouebdQWPxGpSEdRGfVwsri_-v4WHx6r9XOfjvOg66QD85fkkSSYSDJqJXW6ncuP3CphAAic5r_KvPNYn3pmlIgSF5ooXmoT9BsKmaZJTgpBhOilY2HTV13IA9AOJiiOiYVqlrZwxzmyJHJXUGVdpkNQaObMw-VZisdEP-Uf_cx3izs985EeYHYNNp_5LSgB6nNGJYv2X0OXfio9oxqg11CE3cETxFekO0YktjEqaLzyov5fTN8QezqonZUAl21AgVCYFsfvLbzfUGpRltREIb-g" \
    -d '{"sensor_id":"4","timestamp":1526717967,"value":"91827364"}' \
    http://iot.pcxd.me:8083/
```
__Attention:__ At the moment we're using the header `-H "authorization: Bearer <TOKEN>` for authorization with a lowercase __`a`__, thus deviating from common practice. This is due to relying on Node.js libraries that convert all http headers to lowercase (https://github.com/nodejs/node-v0.x-archive/issues/8502). It would be possible to avoid this workaround, by looping over the request's `rawHeaders`-field, however it was decided against this for now, due to performance considerations.

There is a sample Java client available [here]( https://github.com/heldic/iotplatform/blob/master/iotplatform/java-producer/app/src/main/java/Producer.java).


[//]: <########################################################################>
#### WS Gateway
The Websocket gateway is a simple websocket server that waits for incoming client
connections and holds the connection as long as messages are being sent or
the client closes the connection. Authorization is being done during the initial
HTTP-Upgrade (`Connection: Upgrade`) request. In that request, an additional
`authorization` header must be sent, containing a JSON Web Token. In case of a failure, the gateway may terminate the connection and respond with:
- `401 Unauthorized`: `authorization` header is missing or the header's value is inproperly formatted
- `403 Forbidden`: JWT could not be verified, is expired or invalid

There is a sample Python client available [here](https://github.com/heldic/iotplatform/blob/master/iotplatform/python-producer/main.py).


[//]: <########################################################################>
#### MQTT Gateway
The MQTT gateway is relying on Mosca MQTT with Redis as storage backing service.
In order to connect to the broker, the client has to provide authentication credentials,
using `JWT` as username and the actual JWT as password. Additionally, the protocol
has to be specified explicitly on occasion. Once connected, clients can push JSON objects
or arrays of JSON objects by publishing using their device_id as topic.
An examplary connection initialization in Node.js:
```javascript
var client  = mqtt.connect({
    host: <MQTT_GATEWAY_HOST>,
    port: <MQTT_GATEWAY_PORT>,
    username: 'JWT',
    password: <TOKEN>,
    keepalive: 1000,
    settings: {
        protocolId: 'MQIsdp',
        protocolVersion: 3
    }
});
```

There is a sample Node.js client available [here]( https://github.com/heldic/iotplatform/blob/master/iotplatform/nodejs-producer/app/index.js).


[//]: <########################################################################>
### Kafka/Zookeeper
- Collecting all incoming message from the different gateways
- Act as single point of information for subsequent processing layer
- Persistence capabilities of Kafka are neglected since it would be redundant
due to the inclusion of Elasticsearch


[//]: <########################################################################>
### Flink
- Dashboard access: `<HOST>:8081/` (Depending on the environment `<HOST>` has to be replaced by `http://iot.pcxd.me`, `http://localhost` or whereever you deploy iotplatform)
- Offers opportunity to add batch processing or analytical jobs
- Consume Kafka topics and forward data to Elasticsearch
- Jobs are created by IoTCore
- Default job is simply forwarding data without transformation/analysis
- Detects timestamp format and converts it to nanoseconds for Kibana


[//]: <########################################################################>
### Elasticsearch
- REST Access: `<HOST>:9000/` (Depending on the environment `<HOST>` has to be replaced by `http://iot.pcxd.me`, `http://localhost` or whereever you deploy iotplatform)
- Persistence
- Querying capabilities for clients


[//]: <########################################################################>
### Kibana
- Access at `<HOST>:5601/` (Depending on the environment `<HOST>` has to be replaced by `http://iot.pcxd.me`, `http://localhost` or whereever you deploy iotplatform)
- Monitoring opportunity for Elasticsearch (e.g. for Dev Ops)
- Data visualization


[//]: <########################################################################>
### Java/Node.js/Python Producer
- Sample producers to simulate the supported protocols and exemplify usage of the platform



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Data Model
### Device/Sensor Data Model
The platform aims to support creation and data collection for generic devices.
Thus we impose very few restrictions and attributes to devices. Additionally, we
think that it is required to provide a mechanism that enables grouping sensors.
Subsequently, we enable (optional) multi level nesting of sensors under on device
and offer clients tree-like structuring of sensors under a device.

__Definitions:__

Device:
- Entity that may contain zero, one or many sensors
- Clients may add a description to each device containing additional information
- Represents a single (potentially physical) logical unit

Path:
- Optional
- Can point to either another path, or a sensor
- A path cannot be root-node or leaf of the device-tree

Sensor:
- Entity that is always attributed to a single device
- Clients may add a description to each sensor containing additional information
- Clients have to define the type of measurement to specify what values are ingested
- Represents a single physical measuring point, producing a continuous time series of data


[//]: <########################################################################>
### Data Model
An ER-diagram of the data model:

<img src="./doc/diagrams/datamodel.png" />


[//]: <########################################################################>
### Data Model Example
A practical example for leveraging the capabilities of the data model could be
the following. A _Car_-device has four _Wheels_, that each contain a _Pressure Sensor_
collecting values of type double.
The _Wheels_ can be logically separated into _Front_ and _Rear_. These subgroups
can divided again into _Left_ and _Right_. Each of those path nodes points to a
sensor that represents a physical measuring point.
Additionally, the _Car_ has an _Engine_ that contains a _Consumption Sensor_.

The resulting structure:

<img src="./doc/diagrams/datamodel_example.png" />



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Security Concept
### Retrieving JWT Tokens
<img src="./doc/diagrams/security_1.png" />

### Pushing Data
<img src="./doc/diagrams/security_2.png" />



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Gateway Benchmarks
### HTTP Gateways
<img src="./doc/diagrams/benchmark_1.png" />

------

<img src="./doc/diagrams/benchmark_2.png" />

[//]: <########################################################################>
### WS Gateways
<img src="./doc/diagrams/benchmark_3.png" />

------

<img src="./doc/diagrams/benchmark_4.png" />



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Virtual Machines
| Name                | IP             | CPU | VCPU | Ram | Storage |
| ------------------- | -------------- | --- | ---- | --- | ------- |
| Kubernetes_Master   | 141.40.254.145 | 1   | 2    | 4GB | 50GB    |
| Kubernetes_Worker_1 | 141.40.254.147 | 1   | 1    | 8GB | 50GB    |
| Kubernetes_Worker_2 | 141.40.254.146 | 1   | 1    | 8GB | 50GB    |


[//]: <########################################################################>
### Access
You can use any ssh client to access the VM using username of root and certificate file infrastructure/SSH.ppk in this repository



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Kubernetes
### Accessing the Cluster
#### Using `kubectl`
1. Follows this guide to install kubectl on your machine. https://kubernetes.io/docs/tasks/tools/install-kubectl/
2. Copy .kube folder from /infrastructure in this repository to your user's home directory.
3. You can now use kubectl refering to this reference. https://kubernetes.io/docs/reference/kubectl/overview/


[//]: <########################################################################>
#### Using K8s Dashboard
1. Go to https://kube-dashboard.iot.pcxd.me:30443
2. Select "Token".
3. Enter this token into the text field. `eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWt6N3M3Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJkMzViMjRiMS02NWYzLTExZTgtYTJlYi0wMjAxMDBmODAwMjkiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.l9U5z4wcWXBMIYMLH6TJL0FQj4YyfIjQBmFcM7TVWMhiM56PFRrHuxLZ0F-CZ-mSP2O3tAllXsLiy9j6Hsz1Q0DspPbiLv7CZT7l_5RAQ0F3VqVvY3anxX7hx6LgoLiamF9y5Y000wBaZLnpVBZozMp9VVm8UzflhdvQT1L6FI27P9p0SnJ-SZ4D9m_96KOdGGLVc5wNVETjTpugpbC-lqtwD94NTNvyEfkMQfK-_VJaQiGbZN-qSYhh7I1CFkBBaREQgAjubX4aPaox8sMTZtsh5bOzK_HjxwTqua_O25SGfg1q3soB20glGKTuNmA9OnlYMRLmPv50D1IIUHq3Fw`
4. Click "SIGN IN".
5. You are now in the dashboard. Here is some brief introduction about the dashboard. https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#welcome-view

### Setting up the Cluster
#### Preparing the Host
```bash
#!/bin/bash

# Resize FS
df -Th /

fdisk /dev/vda
d
n
p
1
2048
enter

t
L
83

a
p
w

df -Th /
partprobe /dev/vda
df -Th /
resize2fs /dev/vda1
df -Th /

# Docker
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb https://download.docker.com/linux/ubuntu xenial stable"
apt-get update && apt-get install -y docker-ce=17.03.2~ce-0~ubuntu-xenial

# kubeadm
apt-get update && apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb http://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet kubeadm kubectl

# swapoff
swapoff -a
```

#### Adding Nodes
1. On the master node run (token will be expired after 24 hours):
```bash
kubeadm token create
```
2. Run this on the node you want to add:
```bash
kubeadm join 141.40.254.145:6443 --token <TOKEN FROM STEP 1> --discovery-token-ca-cert-hash sha256:1e6253959bd1f6b1b77efee5162083981d889abadb674eb89a62c6a229608178
```



[//]: <############################################################################################>
[//]: <############################################################################################>
[//]: <############################################################################################>
## Outlook
- Activate true persistence, surviving rolling deployments (only Flink missing)
- Finish up on autoscaling
- Improve frontend UX
- Security testing
- Actuator expansion (e.g. connected to Flink)
- Provide more default Flink jobs for analytics
- MQTT performance testing
- Set up alternative to Node.js MQTT gateway (e.g. written in Go - https://github.com/emitter-io/emitter)
- Add support for document/object ingestion in Flink and ES, e.g. for gyro data: `{ "x": <VALUE> }`
