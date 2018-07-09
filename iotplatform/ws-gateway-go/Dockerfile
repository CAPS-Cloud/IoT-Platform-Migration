FROM golang:1.10.3-stretch

USER root

ADD .keys /etc/.keys

COPY . /go/src/github.com/heldic/iotplatform/iotplatform/ws-gateway-go
WORKDIR /go/src/github.com/heldic/iotplatform/iotplatform/ws-gateway-go

RUN go install

RUN chmod a+x ./wait-for-it.sh && \
    chmod a+x ./start.sh

EXPOSE 8766

ENTRYPOINT ["./start.sh"]
