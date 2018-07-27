FROM nginx:1.15

COPY default.conf /etc/nginx/conf.d/

COPY wait-for-it.sh /
RUN chmod u+x /wait-for-it.sh

COPY web/index.html /usr/share/nginx/html/index.html
COPY web/dist /usr/share/nginx/html/static
