FROM python:alpine

RUN apk update \
 && apk add jq \
 && apk add bash \
 && apk add curl \
 && rm -rf /var/cache/apk/*

WORKDIR /app
COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY main.py /app

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

COPY prepare-integration-test.sh /
RUN chmod a+x /prepare-integration-test.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
