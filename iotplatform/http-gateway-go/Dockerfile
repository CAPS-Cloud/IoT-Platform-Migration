FROM golang:1.10.3-stretch

USER root

ADD .keys /etc/.keys

COPY . /go/src/github.com/heldic/iotplatform/iotplatform/http-gateway-go
WORKDIR /go/src/github.com/heldic/iotplatform/iotplatform/http-gateway-go

RUN go install

RUN chmod a+x ./wait-for-it.sh && \
    chmod a+x ./start.sh

EXPOSE 8084

ENTRYPOINT ["./start.sh"]
