#!/bin/bash
# kubeadm init
kubeadm init --pod-network-cidr=10.244.0.0/16
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# installing pod network

kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/2140ac876ef134e0ed5af15c65e414cf26827915/Documentation/kube-flannel.yml
kubectl taint nodes --all node-role.kubernetes.io/master-

# installing kubernetes dashboard
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/alternative.yaml

# add --enable-skip-login
kubectl -n kubernetes-dashboard edit deployment kubernetes-dashboard

# change clusterIP to NodePort
kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
kubectl create clusterrolebinding serviceaccounts-cluster-admin --clusterrole=cluster-admin --group=system:serviceaccounts

# get external IP address of dashboard
kubectl -n kubernetes-dashboard get service kubernetes-dashboard

# modify node port range and check if the indentation is fine
cat /etc/kubernetes/manifests/kube-apiserver.yaml | sed 's/- --secure-port=6443/- --secure-port=6443\n    - --service-node-port-range=80-32767/' > kube-apiserver.yaml
cp kube-apiserver.yaml /etc/kubernetes/manifests/kube-apiserver.yaml
rm -f kube-apiserver.yaml

# add monitoring
git clone https://github.com/coreos/kube-prometheus.git
cd kube-prometheus
kubectl create -f manifests/setup
until kubectl get servicemonitors --all-namespaces ; do date; sleep 1; echo ""; done
kubectl create -f manifests/
kubectl -n monitoring edit service grafana


# add gitlab registry and change username and password and email
kubectl create secret docker-registry gitlab-registry --docker-server=registry.gitlab.com --docker-username=kkyfury --docker-password= --docker-email=mohak.chadha@tum.de

# create cluster role binding
kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default


# kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic 2_3_64
