#!/bin/bash
source ./versions

# Installing maven
apt-get install maven


# Installing helm
wget https://get.helm.sh/helm-v2.16.1-linux-amd64.tar.gz
tar -xvf helm-v2.16.1-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/helm

# putting kafka binaries in the iot core directoy
wget http://apache.lauf-forum.at/kafka/2.4.1/kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
tar -xvf kafka_$SCALA_VERSION-$KAFKA_VERSION.tgz
mv kafka_$SCALA_VERSION-$KAFKA_VERSION ../iotcore/app/kafka_$SCALA_VERSION-$KAFKA_VERSION


# Installing docker and docker-compose
apt-get install -y docker.io
curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Installing kubernetes
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb http://apt.kubernetes.io/ kubernetes-xenial main
EOF
exit
apt-get update
apt-get install -y kubelet kubeadm kubernetes-cni

