FROM golang

# add entrypoint script
COPY start.sh /
COPY main.go /
RUN chmod u+x /start.sh
RUN chmod u+x /main.go

RUN mkdir /protos
COPY ./protos/helloworld.proto /protos/

EXPOSE 8085 50055

ENTRYPOINT /start.sh
