FROM python

WORKDIR /app
COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY main.py /app

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

# add entrypoint script
USER root
COPY start.sh /
RUN chmod u+x /start.sh

ENTRYPOINT /start.sh
